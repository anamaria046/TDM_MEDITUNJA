$ErrorActionPreference = "Stop"

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

public class WinScard {
    [StructLayout(LayoutKind.Sequential)]
    public struct IO_REQUEST { public uint Protocol; public uint PciLength; }

    [DllImport("winscard.dll")]
    public static extern int SCardEstablishContext(uint scope, IntPtr r1, IntPtr r2, out IntPtr ctx);

    [DllImport("winscard.dll")]
    public static extern int SCardReleaseContext(IntPtr ctx);

    [DllImport("winscard.dll", CharSet = CharSet.Unicode)]
    public static extern int SCardListReaders(IntPtr ctx, string groups, char[] readers, ref int len);

    [DllImport("winscard.dll", CharSet = CharSet.Unicode)]
    public static extern int SCardConnect(IntPtr ctx, string reader, uint share, uint protocols, out IntPtr card, out uint activeProtocol);

    [DllImport("winscard.dll")]
    public static extern int SCardDisconnect(IntPtr card, uint disposition);

    [DllImport("winscard.dll")]
    public static extern int SCardTransmit(IntPtr card, ref IO_REQUEST send, byte[] sendBuf, int sendLen, IntPtr recv, byte[] recvBuf, ref int recvLen);
}
"@

$puerto = 8765
$tiempoEsperaMs = 30000
$pausaSondeoMs = 250
$ausenciasParaRearmar = 3
$origenLocalPermitido = '^https?://(?:localhost|127\.0\.0\.1)(?::\d+)?$'
$origenesPermitidos = @()
if ($env:MEDITUNJA_NFC_ORIGINS) {
    $origenesPermitidos = $env:MEDITUNJA_NFC_ORIGINS.Split(',') |
        ForEach-Object { $_.Trim() } |
        Where-Object { $_ }
}
$contexto = [IntPtr]::Zero
$servidor = $null

function Obtener-Lector {
    $longitud = 0
    $resultado = [WinScard]::SCardListReaders($contexto, $null, $null, [ref]$longitud)
    if ($resultado -ne 0 -or $longitud -le 0) {
        throw "Windows no detecta lectores NFC. Conecta el ACR122U y verifica el servicio Smart Card."
    }

    $buffer = New-Object char[] $longitud
    $resultado = [WinScard]::SCardListReaders($contexto, $null, $buffer, [ref]$longitud)
    if ($resultado -ne 0) {
        throw "No se pudo consultar la lista de lectores NFC."
    }

    $lectores = (-join $buffer).Split([char]0) | Where-Object { $_ }
    $lector = $lectores | Where-Object { $_ -match "ACR122|ACS" } | Select-Object -First 1
    if (-not $lector) { $lector = $lectores[0] }
    return $lector
}

function Leer-Uid($lector) {
    $limite = [DateTime]::UtcNow.AddMilliseconds($tiempoEsperaMs)
    $tarjetaPresente = $false
    $ausenciasSeguidas = 0

    while ([DateTime]::UtcNow -lt $limite) {
        Start-Sleep -Milliseconds $pausaSondeoMs
        $tarjeta = [IntPtr]::Zero
        $protocolo = 0
        $resultado = [WinScard]::SCardConnect(
            $contexto, $lector, 2, 3, [ref]$tarjeta, [ref]$protocolo
        )
        if ($resultado -ne 0) {
            $ausenciasSeguidas++
            if ($ausenciasSeguidas -ge $ausenciasParaRearmar) { $tarjetaPresente = $false }
            continue
        }
        $ausenciasSeguidas = 0

        try {
            if ($tarjetaPresente) { continue }

            $io = New-Object WinScard+IO_REQUEST
            $io.Protocol = $protocolo
            $io.PciLength = 8
            $apdu = [byte[]](0xFF, 0xCA, 0x00, 0x00, 0x00)
            $respuesta = New-Object byte[] 258
            $longitud = $respuesta.Length
            $resultado = [WinScard]::SCardTransmit(
                $tarjeta, [ref]$io, $apdu, $apdu.Length, [IntPtr]::Zero,
                $respuesta, [ref]$longitud
            )
            if ($resultado -ne 0 -or $longitud -lt 6 -or
                $respuesta[$longitud - 2] -ne 0x90 -or
                $respuesta[$longitud - 1] -ne 0x00) {
                continue
            }

            $uid = -join ($respuesta[0..($longitud - 3)] |
                ForEach-Object { $_.ToString("X2") })
            if ($uid -notmatch '^(?:[A-F0-9]{2}){2,20}$') { continue }
            return $uid
        }
        finally {
            [void][WinScard]::SCardDisconnect($tarjeta, 0)
        }
    }

    throw "No se detectó una tarjeta. Acércala al lector e inténtalo de nuevo."
}

function Enviar-Respuesta($cliente, $estado, $cuerpo, $origen) {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($cuerpo)
    $cabeceras = "HTTP/1.1 $estado`r`nContent-Type: application/json; charset=utf-8`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n"
    if ($origen) {
        $cabeceras += "Access-Control-Allow-Origin: $origen`r`nVary: Origin`r`n"
    }
    $cabeceras += "`r`n"
    $cabeceraBytes = [System.Text.Encoding]::ASCII.GetBytes($cabeceras)
    $flujo = $cliente.GetStream()
    $flujo.Write($cabeceraBytes, 0, $cabeceraBytes.Length)
    $flujo.Write($bytes, 0, $bytes.Length)
    $flujo.Flush()
}

$resultado = [WinScard]::SCardEstablishContext(0, [IntPtr]::Zero, [IntPtr]::Zero, [ref]$contexto)
if ($resultado -ne 0) {
    throw "No se pudo abrir el servicio Smart Card de Windows."
}

try {
    $servidor = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $puerto)
    $servidor.Start()
    Write-Host "Puente NFC activo en http://127.0.0.1:$puerto"
    Write-Host "Deja esta ventana abierta y entra al módulo de vinculación NFC."
    Write-Host "Presiona Ctrl+C para detener el puente."

    while ($true) {
        $cliente = $servidor.AcceptTcpClient()
        try {
            $flujo = $cliente.GetStream()
            $lectorHttp = New-Object System.IO.StreamReader($flujo, [System.Text.Encoding]::ASCII, $false, 1024, $true)
            $linea = $lectorHttp.ReadLine()
            $metodo = $null
            $ruta = $null
            if ($linea -and $linea -match '^(GET|OPTIONS)\s+(/\S*)\s+HTTP/') {
                $metodo = $Matches[1]
                $ruta = $Matches[2].Split('?')[0]
            }
            $origen = $null
            while ($true) {
                $cabecera = $lectorHttp.ReadLine()
                if ($null -eq $cabecera -or $cabecera.Length -eq 0) { break }
                if ($cabecera -match '^(?i:Origin):\s*(https?://\S+)\s*$') {
                    $origen = $Matches[1]
                }
            }

            if (-not $metodo) {
                Enviar-Respuesta $cliente '400 Bad Request' '{"error":"solicitud_invalida"}' $origen
                continue
            }

            if ($metodo -eq 'OPTIONS') {
                if (-not $origen -or
                    ($origen -notmatch $origenLocalPermitido -and $origen -notin $origenesPermitidos)) {
                    Enviar-Respuesta $cliente '403 Forbidden' '{"error":"origen_no_permitido"}' $null
                    continue
                }
                $bytes = [System.Text.Encoding]::ASCII.GetBytes(
                    "HTTP/1.1 204 No Content`r`nAccess-Control-Allow-Origin: $origen`r`nAccess-Control-Allow-Methods: GET, OPTIONS`r`nAccess-Control-Allow-Headers: Content-Type`r`nAccess-Control-Allow-Private-Network: true`r`nAccess-Control-Max-Age: 600`r`nVary: Origin`r`nContent-Length: 0`r`nConnection: close`r`n`r`n"
                )
                $flujo.Write($bytes, 0, $bytes.Length)
                $flujo.Flush()
                continue
            }

            if ($ruta -eq '/health') {
                Enviar-Respuesta $cliente '200 OK' '{"disponible":true}' $origen
                continue
            }

            if ($ruta -ne '/scan') {
                Enviar-Respuesta $cliente '404 Not Found' '{"error":"ruta_no_encontrada"}' $origen
                continue
            }

            if (-not $origen -or
                ($origen -notmatch $origenLocalPermitido -and $origen -notin $origenesPermitidos)) {
                Enviar-Respuesta $cliente '403 Forbidden' '{"error":"origen_no_permitido"}' $null
                continue
            }

            try {
                $lector = Obtener-Lector
                $uid = Leer-Uid $lector
                Write-Host "Tarjeta leída: $uid"
                $cuerpo = @{ uid = $uid } | ConvertTo-Json -Compress
                Enviar-Respuesta $cliente '200 OK' $cuerpo $origen
            }
            catch {
                $mensaje = $_.Exception.Message
                Write-Warning $mensaje
                $cuerpo = @{ error = $mensaje } | ConvertTo-Json -Compress
                $estado = if ($mensaje -like 'No se detectó una tarjeta*') {
                    '408 Request Timeout'
                } else {
                    '503 Service Unavailable'
                }
                Enviar-Respuesta $cliente $estado $cuerpo $origen
            }
        }
        catch {
            Write-Warning "No se pudo procesar la solicitud local: $($_.Exception.Message)"
        }
        finally {
            $cliente.Close()
        }
    }
}
finally {
    if ($servidor) { $servidor.Stop() }
    [void][WinScard]::SCardReleaseContext($contexto)
}
