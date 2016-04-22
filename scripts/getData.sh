
#Get PA codes for 382 voting areas
(echo '"id","name"'); (curl -s 'http://election.pressassociation.com/Advisories/EU_voting_areas_by-region_2016.php' | pup '#main pre text{}' | sed '/^\s*$/d;s/^ *//g;;s/\.\ /,/g') >..data/ft/paCodes.csv

#get ONS GSS codes for 381 voting areas
curl -s https://mapit.mysociety.org/areas/LBO,DIS,UTA,MTD,COI | jq '[.[] | {my_society_id:.id,ons_id:.codes.gss,name:.name}]' | in2csv -f json >..data/ft/gssCodes.csv

#manually added Gibraltar to both datasets

#simplify MySociety names

#join datasets