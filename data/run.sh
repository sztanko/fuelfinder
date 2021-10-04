f="great-britain-latest.osm.pbf"
url="https://download.geofabrik.de/europe/$f"
wget -O - http://m.m.i24.cc/osmconvert.c | cc -x c - -lz -O3 -o osmconvert
wget -c $url
echo "id\tlon\tlat\tamenity\tname\taddr\tbrand\toperator\tphone\tself_service\tamenity" > stations.csv
time  ./osmconvert $f --all-to-nodes --max-objects=350000000 --hash-memory=1000 --csv="@id @lon @lat amenity name addr brand operator phone self_service amenity" --csv-headline | grep fuel >> stations.csv
