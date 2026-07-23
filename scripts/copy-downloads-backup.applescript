-- Kopiér Downloads til Google Drive-backup
-- Rediger destFolder, så den matcher din Mac

on run
	set sourceFolder to POSIX path of (path to downloads folder)
	-- Ret stien herunder til din egen Google Drive-backupmappe:
	set destFolder to (POSIX path of (path to home folder)) & "Library/CloudStorage/GoogleDrive-DIN_EMAIL/Mit drev/Backups/Downloads_Mac_Backup"
	
	try
		do shell script "mkdir -p " & quoted form of destFolder
		do shell script "rsync -au --exclude='.DS_Store' --exclude='.localized' --exclude='*.crdownload' --exclude='*.download' " & quoted form of (sourceFolder) & " " & quoted form of destFolder
		display notification "Downloads er kopieret til backup." with title "Copy Downloads to Backup"
	on error errMsg number errNum
		display notification errMsg with title "Copy Downloads to Backup" sound name "Basso"
		error errMsg number errNum
	end try
end run
