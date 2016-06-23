#!/usr/bin/env bash

TMP_DIR=$1;
RESULTS_DIR=$TMP_DIR/pa;
OUTPUT_DIR=$TMP_DIR/results;
OVERRIDE_DIR=$TMP_DIR/override;
export PUBLIC_DATA_DIR=$2
OVERRIDE_SPREADSHEET_KEY=1AlfpfzszEPSyYP2iaUpsjBUa-HBAU4f4YNUVgnuVNwM;
OVERRIDE_URL=https://bertha.ig.ft.com/republish/publish/gss/$OVERRIDE_SPREADSHEET_KEY/areas,regions,national,config

echo " ";
echo "Begin run";
date;
echo " ";
echo PATH=$PATH;

mkdir -pv -m ugo+rwx,+X $RESULTS_DIR && \
mkdir -pv -m ugo+rwx,+X $OUTPUT_DIR && \
mkdir -pv -m ugo+rwx,+X $OVERRIDE_DIR && \
mkdir -pv -m ugo+rwx,+X $PUBLIC_DATA_DIR;

echo "download override: $OVERRIDE_URL";
curl --retry 1 -m 5 -f -o $OVERRIDE_DIR/override.json $OVERRIDE_URL;

echo "start PA FTP Mirroring";
time lftp ftp://$PA_USERNAME:$PA_PASSWORD@ftpout.pa.press.net -e "set net:reconnect-interval-base 5; set net:max-retries 3; mirror --use-cache --use-pget-n=10 --parallel=5 --only-missing --verbose /results $RESULTS_DIR; quit" 2>&1;

echo "build all the results files in to a tmp directory"
node bin/results $RESULTS_DIR $OVERRIDE_DIR $OUTPUT_DIR;
chmod -R ugo+rw $TMP_DIR;

echo "Move the temp directory files to live"
mv -f $OUTPUT_DIR/*.{csv,json} $PUBLIC_DATA_DIR;
chmod -R ugo+rw $PUBLIC_DATA_DIR;
echo " ";
date;
echo "All done!"
exit;
