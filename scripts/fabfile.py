from fabric.api import *
from fabric.contrib.console import confirm

env.hosts = ['ftlnx109-lviw-uk-p']

##### Change these to reflect your own our username
env.user = 'Luke.Kavanagh'
#####

temp_location = '/var/tmp/' + env.user + '/deployment_tmp/'
project_name = 'euref-resultspage'
server_location = ''

location = '/var/opt/customer/apps/interactive.ftdata.co.uk/var/www/scripts/' + project_name

@task
def publish():
  local('tar --exclude="./node_modules" --exclude="./*.tgz" --exclude="./fabfile.*" -czf ' + project_name + '.tgz ./')

  put( project_name + '.tgz', temp_location )  #push to server

  with cd(location):        #untar to the correct location
    sudo('tar xzf ' + temp_location + project_name+'.tgz')
    sudo('chmod -R ugo+rw ' + location)
    sudo('chmod ugo+rwx ' + location + '/build-results-page.js')
    run('npm install')      #install node modules

  print 'PUBLISHED!\n\n' + location
  update_config()


@task
def update_config():
  put('config-server.json', location + '/config.json')
  sudo('chmod -R ug+rw ' + location + '/config.json')
  print 'CONFIG UPDATED!\n\n'

@task
def run_app():
  with cd(location):
    run('npm run start')
