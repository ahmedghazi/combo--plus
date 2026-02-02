import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'k8hpofcg',
    dataset: 'production',
  },

  studioHost: 'backoffice--combo-plus',
  deployment: {
    autoUpdates: true,
    appId: 'hor98cb1pl3rwgordryc5w8i',
  },
})
