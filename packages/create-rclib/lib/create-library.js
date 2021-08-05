/* eslint-disable no-unused-vars */
/* eslint-disable space-before-function-paren */
/* eslint-disable prefer-promise-reject-errors */
'use strict'

const handlebars = require('handlebars')
const os = require('os')
const chalk = require('chalk')
const spawn = require('cross-spawn')
const execa = require('execa')
const fs = require('fs-extra')
const globby = require('globby')
const mkdirp = require('make-dir')
const ora = require('ora')
const path = require('path')
const pEachSeries = require('p-each-series')

const pkg = require('../package')

const templateBlacklist = new Set([
  'example/public/favicon.ico',
  'example/public/.gitignore',
  '.git'
])

module.exports = async info => {
  const { manager, template, name, templatePath, git } = info

  // return Promise.resolve()

  // handle scoped package names
  const parts = name.split('/')
  info.shortName = parts[parts.length - 1]
  info.dest = path.join(process.cwd(), info.shortName)
  const dest = info.dest
  const templatePattern = 'crl-template-'
  // handle scoped package names
  const parts1 = (templatePath || '').split('/')
  const templateName = parts1[parts1.length - 1]
  const rometeTemplate =
    template === 'custom' && templateName.startsWith(templatePattern)

  // console.log(rometeTemplate, 'rometeTemplate')

  await mkdirp(dest)

  if (rometeTemplate) {
    await module.exports.setupFromRemoteTempalte({
      dest,
      manager,
      name,
      templatePath,
      info
    })
  } else {
    await module.exports.setupFromLocalTempalte({
      dest,
      info,
      template,
      manager,
      templatePath
    })
  }

  // 09.init git repository
  if (git) {
    const promise = module.exports.initGitRepo({ dest })
    ora.promise(promise, 'Initializing git repo')
    await promise
  }

  return dest
}

module.exports.copyTemplateFile = async opts => {
  const { file, source, dest, info } = opts

  const fileRelativePath = path.relative(source, file).replace(/\\/g, '/')
  if (fileRelativePath.startsWith('.git')) {
    return
  }

  const destFilePath = path.join(dest, fileRelativePath)
  const destFileDir = path.parse(destFilePath).dir
  console.log(fileRelativePath)

  await mkdirp(destFileDir)

  if (templateBlacklist.has(fileRelativePath)) {
    const content = fs.readFileSync(file)
    fs.writeFileSync(destFilePath, content)
  } else {
    const template = handlebars.compile(fs.readFileSync(file, 'utf8'))
    const content = template({
      ...info,
      yarn: info.manager === 'yarn'
    })

    fs.writeFileSync(destFilePath, content, 'utf8')
  }

  return fileRelativePath
}

module.exports.initPackageManagerRoot = async opts => {
  const { dest, info } = opts

  const commands = [
    {
      cmd: info.manager,
      args: ['install'],
      cwd: dest
    }
  ]

  return pEachSeries(commands, async ({ cmd, args, cwd }) => {
    return execa(cmd, args, { cwd })
  })
}

module.exports.initPackageManagerExample = async opts => {
  const { dest, info } = opts
  const example = path.join(dest, 'example')

  const commands = [
    {
      cmd: info.manager,
      args: ['install'],
      cwd: example
    }
  ]

  return pEachSeries(commands, async ({ cmd, args, cwd }) => {
    return execa(cmd, args, { cwd })
  })
}

module.exports.setupFromRemoteTempalte = async opts => {
  const { dest, manager, name, templatePath, info } = opts
  const command = manager
  const useYarn = manager === 'yarn'
  const remove = useYarn ? 'remove' : 'uninstall'
  const prod = useYarn ? [] : ['--save']
  const dev = useYarn ? ['--dev'] : ['--save-dev']
  const args = useYarn ? ['add'] : ['install', '--no-audit']
  const templateName = templatePath

  // 01.mkdir dest
  // 02.cd to dest
  // 03.create dest/package.json
  // 04.install crl-template package
  // 05.merge template package info to app package
  // 06.install template's dependencies devDependencies from crl-template/template.json
  // 07.copy crl-template/template to dest
  // 08.remove crl-template
  // 09.init git repository

  const appPath = path.resolve(dest)

  // 02.cd to dest
  process.chdir(appPath)

  // 03.create dest/package.json
  const packageJson = {
    name: name,
    version: '0.1.0',
    private: true,
    license: info.license,
    author: info.author,
    description: info.desc,
    repository: info.repo
  }

  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(packageJson, null, 2) + os.EOL
  )

  // 04.install crl-template package
  console.log()
  console.log(`Installing template package using ${command}...`)

  // const temp = path.resolve(__dirname, '../../', templateName)
  const proc = spawn.sync(command, args.concat(prod, templateName), {
    stdio: 'inherit'
  })
  if (proc.status !== 0) {
    console.error(`\`${command} ${args.join(' ')}\` failed`)
    process.exit(1)
  }

  const templateRootDir = path.dirname(
    require.resolve(path.join(templateName, 'package.json'), {
      paths: [appPath]
    })
  )
  const templateJsonPath = path.join(templateRootDir, 'template.json')
  let templateJson = {}
  if (fs.existsSync(templateJsonPath)) {
    templateJson = require(templateJsonPath)
  }

  const templatePackage = templateJson.package || {}
  const templateScripts = templatePackage.scripts || {}
  const appPackage = require(path.join(appPath, 'package.json'))
  appPackage.dependencies = appPackage.dependencies || {}
  appPackage.scripts = { ...appPackage.scripts, ...templateScripts }

  // Keys to ignore in templatePackage
  const templatePackageBlacklist = [
    'name',
    'version',
    'description',
    'keywords',
    'bugs',
    'license',
    'author',
    'contributors',
    'files',
    'browser',
    'bin',
    'man',
    'directories',
    'repository',
    // 'peerDependencies',
    'bundledDependencies',
    'optionalDependencies',
    'engineStrict',
    'os',
    'cpu',
    'preferGlobal',
    'private',
    'publishConfig'
  ]

  // Keys from templatePackage that will be merged with appPackage
  const templatePackageToMerge = ['dependencies', 'devDependencies', 'scripts']

  // Keys from templatePackage that will be added to appPackage,
  // replacing any existing entries.
  const templatePackageToReplace = Object.keys(templatePackage).filter(key => {
    return (
      !templatePackageBlacklist.includes(key) &&
      !templatePackageToMerge.includes(key)
    )
  })
  // 05.merge template package info to app package
  templatePackageToReplace.forEach(key => {
    appPackage[key] = templatePackage[key]
  })

  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2) + os.EOL
  )

  // Install additional template dependencies, if present.
  const dependenciesToInstall = Object.entries({
    ...templatePackage.dependencies
  }).map(([dependency, version]) => {
    return `${dependency}@${version}`
  })

  // 06.Install template's dependencies devDependencies from crl-template/template.json
  if (dependenciesToInstall.length) {
    console.log()
    console.log(`Installing template dependencies using ${command}...`)
    console.log()

    const proc = spawn.sync(command, args.concat(prod, dependenciesToInstall), {
      stdio: 'inherit'
    })

    if (proc.status !== 0) {
      console.error(`\`${command} ${args.join(' ')}\` failed`)
      process.exit(1)
    }
  }

  const devDependenciesToInstall = Object.entries({
    ...templatePackage.devDependencies
  }).map(([dependency, version]) => {
    return `${dependency}@${version}`
  })

  if (devDependenciesToInstall.length) {
    console.log()
    console.log(`Installing template devDependencies using ${command}...`)
    console.log()

    const proc = spawn.sync(
      command,
      args.concat(dev, devDependenciesToInstall),
      { stdio: 'inherit' }
    )

    if (proc.status !== 0) {
      console.error(`\`${command} ${args.join(' ')}\` failed`)
      process.exit(1)
    }
  }

  // 07.copy crl-template/template to dest
  console.log()
  console.log(`Copying template files to ${appPath}...`)
  console.log()

  const templateDir = path.join(templateRootDir, 'template')
  if (fs.existsSync(templateDir)) {
    fs.copySync(templateDir, appPath)
  } else {
    console.error(
      `Could not locate supplied template: ${chalk.green(templateDir)}`
    )
    process.exit(1)
  }

  // 08.remove crl-template
  console.log()
  console.log(`Removing template package using ${command}...`)
  console.log()

  const proc2 = spawn.sync(command, [remove, templateName], {
    stdio: 'inherit'
  })

  if (proc2.status !== 0) {
    console.error(`\`${command} ${args.join(' ')}\` failed`)
    process.exit(1)
  }

  console.log()
  console.log(`remote setuped`)
  return Promise.resolve()
}

module.exports.setupFromLocalTempalte = async opts => {
  const { dest, info, template, manager, templatePath } = opts

  const source =
    template === 'custom'
      ? path.join(process.cwd(), templatePath)
      : path.join(__dirname, '..', 'template', template)

  const ignore =
    info.example === 'No'
      ? [path.join(source, 'example', '**').replace(/\\/g, '/')]
      : []

  const files = await globby([source.replace(/\\/g, '/')], {
    dot: true,
    ignore
  })

  {
    // 07.move crl-template/template to dest
    const promise = pEachSeries(files, async file => {
      return module.exports.copyTemplateFile({
        file,
        source,
        dest,
        info
      })
    })
    ora.promise(promise, `Copying ${template} template to ${dest}`)
    console.log()
    await promise
  }

  {
    console.log()
    console.log('Initializing npm dependencies. This will take a minute.')
    console.log()

    const rootP = module.exports.initPackageManagerRoot({ dest, info })
    ora.promise(rootP, `Running ${manager} install in root directory`)
    await rootP

    if (info.example === 'Yes') {
      const exampleP = module.exports.initPackageManagerExample({ dest, info })
      ora.promise(exampleP, `Running ${manager} install in example directory`)
      await exampleP
    }
  }
}

module.exports.initGitRepo = async opts => {
  const { dest } = opts

  const gitignoreExists = fs.existsSync(path.join(dest, '.gitignore'))

  if (gitignoreExists) {
    const _gitignoreExists = fs.existsSync(path.join(dest, 'gitignore'))
    if (_gitignoreExists) {
      // Append if there's already a `.gitignore` file there
      const data = fs.readFileSync(path.join(dest, 'gitignore'))
      fs.appendFileSync(path.join(dest, '.gitignore'), data)
      fs.unlinkSync(path.join(dest, 'gitignore'))
    }
  } else {
    const _gitignoreExists = fs.existsSync(path.join(dest, 'gitignore'))
    if (_gitignoreExists) {
      // Rename gitignore after the fact to prevent npm from renaming it to .npmignore
      // See: https://github.com/npm/npm/issues/1862
      fs.moveSync(
        path.join(dest, 'gitignore'),
        path.join(dest, '.gitignore'),
        []
      )
    } else {
      const gitIgnorePath = path.join(__dirname, '../', '.gitignore.example')
      fs.copySync(gitIgnorePath, path.join(dest, '.gitignore'), [])
    }
  }

  const commands = [
    {
      cmd: 'git',
      args: ['init'],
      cwd: dest
    },
    {
      cmd: 'git',
      args: ['add', '.'],
      cwd: dest
    },
    {
      cmd: 'git',
      args: ['commit', '-m', `init ${pkg.name}@${pkg.version}`],
      cwd: dest
    }
  ]

  return pEachSeries(commands, async ({ cmd, args, cwd }) => {
    // console.log()
    // console.log(cmd, args.join(' '))
    return execa(cmd, args, { cwd })
  })
}
