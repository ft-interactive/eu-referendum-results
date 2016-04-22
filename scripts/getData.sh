#remove unneeded PA data
rm -rf data/pa/nominations

#Get PA codes for 382 voting areas
(echo '"pa_id","name"') >data/ft/paCodes.csv;
(curl -s 'http://election.pressassociation.com/Advisories/EU_voting_areas_by-region_2016.php' | pup '#main pre text{}' | sed '/^\s*$/d;s/^ *//g;;s/\.\ /,/g' | sed s/"\&amp\;"/"and"/g | csvsort -c 2) >>data/ft/paCodes.csv

#get ONS GSS codes for 381 voting areas
curl -s https://mapit.mysociety.org/areas/LBO,DIS,UTA,MTD,COI | jq '[.[] | {my_society_id:.id,ons_id:.codes.gss,name:.name}]' | in2csv -f json | sed -E s/"( ){0,1}(Borough|District|City){0,1} (Council|Corporation)$"//g >data/ft/gssCodes.csv

#Change PA names to FT style
cat data/ft/gssCodes.csv | sed s/" County"//g | sed s/"City of Edinburgh"/"Edinburgh"/1 | sed s/"City of York"/"York"/1 | sed s/"Comhairle nan Eilean Siar"/"Na h-Eileanan Siar"/1 | sed s/"Kingston upon Thames"/"Kingston-upon-Thames"/1 | sed s/"Richmond upon Thames"/"Richmond-upon-Thames"/1 | sed s/"Newcastle upon Tyne"/"Newcastle-upon-Tyne"/1 >data/ft/gssCodes2.csv

#Change MySociety Names to FT Style
cat data/ft/paCodes.csv | sed s/"Anglesey"/"Isle of Anglesey"/1 | sed s/"Comhairle Nan Eilean Siar"/"Na h-Eileanan Siar"/1 | sed s/"Kingston-upon-Hull"/"Hull"/1 | sed s/"Kings Lynn and West Norfolk"/"King\'s Lynn and West Norfolk"/1 | sed s/"Windsor and Maidenhead Royal"/"Windsor and Maidenhead"/1 >data/ft/paCodes2.csv

#Add Gibraltar and Northern Ireland to GSS dataset
echo "9999,G99999999,Gibraltar" >>data/ft/gssCodes2.csv
echo "8888,N88888888,Northern Ireland" >>data/ft/gssCodes2.csv

#join datasets and clean up column order to make master lookup
csvjoin -c 2,3 data/ft/paCodes2.csv data/ft/gssCodes2.csv | csvcut -c 1,4,3,2 | csvsort -c 4 >data/ft/lookup.csv

#clean up temporary data files
rm data/ft/gssCodes.csv
rm data/ft/gssCodes2.csv
rm data/ft/paCodes.csv
rm data/ft/paCodes2.csv

#make detail pages
mkdir site
mkdir site/area
touch site/index.md
touch site/area/index.md
for area in $(csvcut -c 4 data/ft/lookup.csv | sed s/" "/"-"/g | sed s/"\'"//g | tr '[:upper:]' '[:lower:]')
do
	echo $area
	mkdir site/area/$area
	touch site/area/$area/index.md
done