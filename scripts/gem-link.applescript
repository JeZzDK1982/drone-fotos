-- Gem aktiv Chrome-fane i Apple Noter
-- Gem filen og kør den fra Script Editor, eller lav en app/genvej

tell application "Google Chrome"
	set theTab to active tab of front window
	set pageTitle to title of theTab
	set pageURL to URL of theTab
end tell

set noteText to "📅 " & ((current date) as string) & return & ¬
	"📰 " & pageTitle & return & ¬
	"🔗 " & pageURL & return & return

tell application "Notes"
	activate
	
	set folderName to "Noter"
	set noteName to "Gemte links"
	
	try
		set targetFolder to folder folderName
	on error
		set targetFolder to make new folder with properties {name:folderName}
	end try
	
	try
		set targetNote to first note of targetFolder whose name is noteName
		set body of targetNote to body of targetNote & noteText
	on error
		make new note at targetFolder with properties {name:noteName, body:noteText}
	end try
end tell
