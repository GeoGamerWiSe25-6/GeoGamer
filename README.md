# GeoGamerBackend

## Datenbank
1. Datenbank dump herunterladen unter: https://drive.google.com/file/d/1qVdwcdzCOn8RuParnqo0kt6eO3Y_UkA6/view?usp=drive_link
2. Datei verschieben in "data/postgis/init/communities.sql"
3. Datenbank anlegen und initialisieren
    a) Per CLI (aus dem Verzeichnis data/postgis/init): 
```
     createdb geogamer
     psql -d geogamer -c "CREATE EXTENSION postgis;"
     psql -d geogamer -f communities.sql



    # Wenn nötig (Fehler) -U Option hinzufügen und ggf. sudo:
    createdb -U <DB_USER> geogamer
    psql -U <DB_USER> -d geogamer -c "CREATE EXTENSION postgis;"
    psql -U <DB_USER>  -d geogamer -f communities.sql
``` 
   b) Über pgAdmin UI: <br>
      I.   Object -> Create -> Database (Name 'geogamer') <br>
      II.  Query Tool -> File -> Open -> communities.sql <br>
      III. Execute