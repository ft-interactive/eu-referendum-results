#build-results-page.js
Script to publish results page and Falcon homepage widget for the EU referendum
publishes to 
ig.ft.com/sites/elections/2016/uk/eu-referendum/index.html
and 
ig.ft.com/sites/elections/2016/uk/eu-referendum/homepage-widget.html

```/var/opt/customer/apps/interactive.ftdata.co.uk/var/www/html/sites/elections/2016/uk/eu-referendum/```

##Deployment

The script is deployed by fabric http://www.fabfile.org/

To get the latest version to the server type `fab publish`

To run the application on the server type `fab run_app`

To update the script configuration from the server_config.json file type `fab update_config` (see _Script Configuration_ section below)

##Script Configuration

The script's outputs and inputs are configured via a json file. For local development this is `config.json` on the live server it is `config_server.json` (renamed when it is deployed to `config.json`)  

Most of the config file's fields are self explanatory; the location of input and output files.

###`live` 

indicates whether the script is in _live_ mode it is publishing results data. when this is set to false the script simply creates nearly blank HTML files. This is so we can run through the script without publishing dummy data or something else bad.

When you want to start publishing live results then change the `config-server.json` file and send it to the server: `fab update_config`

###`bertha`

the url of a bertha spreadsheet see the _Page Configuration_ section

###`storiesFragment`

the url of an HTML fragment with a list of stories for onward journey

##Page Configuration

the page is configured via a bertha spreadsheet
https://docs.google.com/spreadsheets/d/1s8z5KLLb4FlP3g59FN_o5Knc7iP32ca8Inp8-J_GZU8/edit#gid=2123295097

this allows for the override or removal of various parts of the page