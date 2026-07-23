-- Kør NAS-backup én gang (Downloads → NAS)
-- Rediger stierne, så de matcher din Mac/NAS

set sourceFolder to POSIX path of (path to downloads folder)
set nasVolume to "/Volumes/home/Backups/backup_downloads_mac"

tell application "System Events"
	set nasExists to exists disk "Backup"
end tell

if nasExists then
	do shell script "mkdir -p " & quoted form of nasVolume
	do shell script "rsync -au --exclude='.DS_Store' --exclude='.localized' " & quoted form of sourceFolder & " " & quoted form of nasVolume
	display notification "Downloads er synkroniseret til NAS." with title "NAS Backup"
else
	display notification "Backuppen fejlede: NAS-drevet 'Backup' er ikke monteret." with title "NAS Backup" sound name "Basso"
	error "NAS ikke monteret"
end if
