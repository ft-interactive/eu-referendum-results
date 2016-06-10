#remove (incorrect) regions from old lookup and save correct voting areas
csvcut -c 1-4 lookup.csv >votingAreas.csv

#delete old lookup file
rm lookup.csv

#download district-to-region lookup
curl "https://geoportal.statistics.gov.uk/Docs/Lookups/Local_Authority_Districts_(2015)_to_Regions_(2015)_Eng_lookup.zip" >LA-REG-2015.zip
unzip LA-REG-2015.zip
rm "LA-REG-2015.zip"
rm "LAD15_RGN15_EN_LU_metadata.xml"
rm "Product Specification for LAD15_RGN15_EN_LU.docx"
mv "LAD15_RGN15_EN_LU.csv" lad-reg.csv

#Join English regions to voting areas and fix Gibraltar

csvjoin --left -c 2,1 "votingAreas.csv" "lad-reg.csv" |
csvcut -c 1-4,7-8 |
sed "s/pa_id\,ons_id\,my_society_id\,name\,RGN15CD\,RGN15NM/pa_id\,ons_id\,my_society_id\,name\,ons_regional_id\,region_name/1" | 
sed "s/132\,G99999999\,9999\,Gibraltar\,\,/132\,G99999999\,9999\,Gibraltar\,E12000009\,South West/1;s/South West/South West and Gibraltar/g" | 
csvsort -c 6,4 >lookup-temp.csv

#Use countries as regions outside England
rm non-england.csv
IFS=$'\n'
for line in $(csvgrep -c 2 -r "^[WSN]" lookup-temp.csv)
do
	append=""
	country=$(echo $line | csvcut -c 2 | sed -E "s/[0-9]{8}//g")
	newline=$(echo $line | sed -E ";s/\,\,//g")
	if [ "$country" = "S" ]
	then append=",S92000003,Scotland";
	elif [ "$country" = "W" ]
	then append=",W92000004,Wales"
	elif [ "$country" = "N" ]
	then append=",N92000002,Northern Ireland"
	fi
	echo $newline$append >>non-england.csv
done 

#Make England only file
cat lookup-temp.csv | csvgrep -c 6 -i -r "^$" >england.csv

#Make new lookup file
csvstack england.csv non-england.csv | csvsort -c 6,4 >lookup.csv

#delete temp files
rm england.csv
rm non-england.csv
rm lookup-temp.csv
rm lad-reg.csv
rm LA-REG-2015.zip
