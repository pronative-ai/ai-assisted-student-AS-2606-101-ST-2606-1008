param location string = resourceGroup().location
param appName string
param appInsightsConnectionString string = ''

resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: '${appName}-plan'
  location: location
  sku: {
    name: 'F1'
    tier: 'Free'
  }
}

resource appService 'Microsoft.Web/sites@2023-12-01' = {
  name: appName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      alwaysOn: false
      netFrameworkVersion: 'v10.0'
      appSettings: [
        {
          name: 'DataDirectory'
          value: '/home/data'
        }
        {
          name: 'ApplicationInsights__ConnectionString'
          value: appInsightsConnectionString
        }
        {
          name: 'ASPNETCORE_ENVIRONMENT'
          value: 'Production'
        }
      ]
    }
  }
}

output appUrl string = 'https://${appService.properties.defaultHostName}'
