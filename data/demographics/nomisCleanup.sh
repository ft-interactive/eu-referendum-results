
#Clean up directory
mkdir edit
rm merged.csv

#Clean up files downloaded Census from Nomis
for file in raw/*.csv
do
echo ---- $file ---
filename=$(echo $file | sed "s/raw\//edit\//1")
#echo $filename
cat $file | tail -n +7 | grep -v "^$" | csvcut -c 2- | tail -r | tail -n +5 | tail -r >$filename
echo ---- END OF FILE ---
done

# Remove duplicate GSS columns and merge files
csvjoin --left -c 1 rows.csv edit/*.csv | csvcut -c $(echo $(csvjoin -c 1 rows.csv edit/*.csv | csvcut -n | grep -v "mnemonic" | grep -v "\%" | cut -d ":" -f 1 | tr '\n' ',' | sed "s/,$//1;s/ //g")) | csvsort -c 1 | uniq >merged.csv


#APS file
file=aps/aps-dec2015.csv
filename=$(echo $file | sed "s/aps\//edit\//1")

# get relevant columns
cols=$(echo $(cat $file | tail -n +7 | grep -v "^$" | csvcut -c 2- | tail -r | tail -n +15 | tail -r | csvcut -n | grep -v -E "Numerator|Conf|Denominator" | cut -d ":" -f 1 | tr '\n' ',' | sed "s/,$//1;s/ //g"))

#cut down file
cat $file | tail -n +7 | grep -v "^$" | csvcut -c 2- | tail -r | tail -n +15 | tail -r | csvcut -c $cols >edit/aps.csv

#todo: remove instances of ! from file


