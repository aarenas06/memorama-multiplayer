<?php
// Ruta al directorio del proyecto
$projectDir = __DIR__;

// Comando para instalar dependencias con npm
$installCommand = "npm install   " . $projectDir;

// Ejecutar el comando para instalar dependencias
exec($installCommand, $installOutput, $installStatus);

// Verificar si la instalación de dependencias fue exitosa
if ($installStatus === 0) {
    echo "Se instalaron las dependencias correctamente.<br>";
} else {
    echo "Hubo un error al instalar las dependencias.<br>";
    // Si hay un error, podrías mostrar o registrar la salida del comando para depurar
    // echo "<pre>" . implode("\n", $installOutput) . "</pre>";
    exit(); // Terminar la ejecución si la instalación de dependencias falló
}

// Ruta al archivo server.js
$serverScript = $projectDir . "/server.js";

// Comando para ejecutar el servidor usando npm
$command = "npm start --prefix " . $projectDir . " > " . $outputFile . " 2>&1";

// Ejecutar el comando y obtener la salida
$output = shell_exec($command);

// Imprimir la salida
echo "<pre>$output</pre>";
