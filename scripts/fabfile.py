from fabric.api import *
from fabric.contrib.console import confirm

env.hosts = ['ftlnx109-lviw-uk-p']

##### Change these to reflect your own our username
env.user = 'Tom.Pearson'
#####

temp_location = '/var/tmp/' + env.user + '/deployment_tmp/'
project_name = 'euref-resultspage'
server_location = ''

location = '/var/opt/customer/apps/interactive.ftdata.co.uk/var/www/scripts/uk-election-results-2016/'

@task
def publish(): 
  local('tar --exclude="./node_modules" --exclude="./fabfile.*" -cvf  '.project_name.'.tgz ./')

  put( projectname.'.tgz', temp_location )  #push to server  

  with cd(location):        #untar to the correct location
    run('tar xzf ' + temp_location + project_name+'.tgz')
    run('npm install')      #install node modules

  print 'PUBLISHED!\n\n' + location


@task
def run_app():
  with cd(location):
    sudo('npm run start')