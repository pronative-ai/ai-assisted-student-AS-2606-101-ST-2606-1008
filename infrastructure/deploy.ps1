param(
    [Parameter(Mandatory)]
    [string]$ResourceGroupName,

    [Parameter(Mandatory)]
    [string]$AppName,

    [string]$Location = 'eastus',

    [string]$AppInsightsConnectionString = ''
)

az group create --name $ResourceGroupName --location $Location
az deployment group create `
    --resource-group $ResourceGroupName `
    --template-file main.bicep `
    --parameters appName=$AppName appInsightsConnectionString=$AppInsightsConnectionString
