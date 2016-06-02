
#Clean up directory
mkdir edit
rm merged.csv

#Clean up files downloaded from Nomis
for file in raw/*.csv
do
echo ---- $file ---
filename=$(echo $file | sed "s/raw\//edit\//1")
#echo $filename
cat $file | tail -n +7 | grep -v "^$" | csvcut -c 2- | tail -r | tail -n +5 | tail -r >$filename
echo ---- END OF FILE ---
done

# Remove duplicate GSS columns and merge files
csvjoin --left -c 1 ../rows.csv edit/*.csv | csvcut -c $(echo $(csvjoin -c 1 ../rows.csv edit/*.csv | csvcut -n | grep -v "mnemonic" | grep -v "\%" | cut -d ":" -f 1 | tr '\n' ',' | sed "s/,$//1;s/ //g")) | csvsort -c 1 | uniq >merged.csv




csvjoin -c 1 ../rows.csv *-edited.csv | csvcut -n | grep -v "mnemonic" | cut -d ":" -f 1 | tr '\n' ',' | sed "s/,$//1;s/ //g"

#remove nmeonic columns
cols=$(echo $(csvjoin -c 1 ../rows.csv *-edited.csv | csvcut -n | grep -v "mnemonic" | cut -d ":" -f 1 | tr '\n' ',' | sed "s/,$//1;s/ //g"))

csvcut -n $cols


