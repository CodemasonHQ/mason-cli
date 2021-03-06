const {Command} = require('../../base')
const helpers = require('../../util/helpers')
const chalk = require('chalk')
const _ = require('lodash')

class ServicesIndexCommand extends Command {
  async run() {
    const {args} = this.parse(ServicesIndexCommand)

    this.log('Services for ' + chalk.cyan(args.app))
    this.log()

    const services = await this.getServices(args.app).catch(e => {
      this.error(e)
    })

    const table = helpers.borderlessTable(4)
    table.push(['NAME', 'IMAGE',  'COMMAND', 'PORTS'])

    _.each(services, function (service) {
      var ports = _.get(service, 'rancher.launchConfig.ports', [])
      if (_.isNull(ports)) {
        ports = []
      }

      var command = _.get(service, 'rancher.launchConfig.command', [])
      if (_.isNull(command)) {
        command = []
      }

      table.push([
        _.get(service, 'name'),
        _.get(service, 'rancher.launchConfig.imageUuid', '').replace('docker:', ''),
        command.join(' '),
        ports.join(', '),
      ])
    })

    this.log(table.toString())
  }

  async getServices(app) {
    var team = _.get(this.config, 'userConfig.team.slug')
    return this.codemason.get(`/${team}/apps/${app}/services`)
    .then(response => {
      return _.get(response, 'data')
    })
    .catch(error => {
      if (_.has(error, 'response.data')) {
        throw helpers.parseApiError(error.response.data)
      }

      throw error.toString().replace('Error: ', '')
    })
  }
}

ServicesIndexCommand.args = [
  {
    name: 'app',
    required: true,
  },
]

ServicesIndexCommand.description = 'list your services'

module.exports = ServicesIndexCommand
