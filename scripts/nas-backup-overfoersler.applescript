-- Folder Action: NAS Backup af Overførsler
-- Tilføj scriptet til en mappe via Finder → Mappehandlingsopsætning
-- Rediger nasVolume og disk-navn, så det matcher din NAS

on adding folder items to this_folder after receiving these_items
	set nasVolume to "/Volumes/home/Backups/backup_downloads_mac"
	
	tell application "System Events"
		set nasExists to exists disk "Backup"
	end tell
	
	if nasExists then
		set macMappe to POSIX path of this_folder
		-- -a: bevarer rettigheder/tidsstempler, -u: kopier kun nye/ændrede filer
		do shell script "rsync -au " & quoted form of macMappe & " " & quoted form of nasVolume
	else
		display notification "Backuppen fejlede: NAS-drevet 'Backup' er ikke monteret." with title "Smart Home Backup" sound name "Basso"
	end if
end adding folder items to
