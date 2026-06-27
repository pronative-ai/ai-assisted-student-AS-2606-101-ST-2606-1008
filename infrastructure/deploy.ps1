param(
    [Parameter(Mandatory)]
    [string]$ResourceGroupName,

    [Parameter(Mandatory)]
    [string]$Location,

    [Parameter(Mandatory)]
    [string]$ContainerAppName,

    [Parameter()]
    [string]$ContainerImage = 'opencode-telemetry-api:latest'
)

$ErrorActionPreference = 'Stop'

Write-Host "Creating resource group: $ResourceGroupName in $Location" -ForegroundColor Green
az group create --name $ResourceGroupName --location $Location

Write-Host "Deploying Bicep template..." -ForegroundColor Green
az deployment group create `
    --resource-group $ResourceGroupName `
    --template-file main.bicep `
    --parameters containerAppName=$ContainerAppName containerImage=$ContainerImage

Write-Host "Deployment complete." -ForegroundColor Green
