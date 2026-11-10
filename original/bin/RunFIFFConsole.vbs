
strBaseFolder    = "C:\Sandbox\Test\Original"
strCurrentFolder = "C:\Sandbox\Test\Modified"
strResultFolder  = "C:\Sandbox\Test"

strExeFile     = "%comspec% /c C:\Sandbox\Test\FIFFConsole.exe"

Set objShell = CreateObject("WScript.Shell")
Set objFSO   = CreateObject("Scripting.FileSystemObject")

Call runCompare

Function runCompare
	On Error Resume Next
	
	If objFSO.FolderExists(strResultFolder) = False Then
		objFSO.CreateFolder(strResultFolder)
	End If

	Set objCurrentFolder = objFSO.GetFolder(strCurrentFolder)

	Set colFiles = objCurrentFolder.Files

	For Each objFile in colFiles
		strFileBase    = strBaseFolder    & "\" & objFile.Name
		strFileCurrent = strCurrentFolder & "\" & objFile.Name
		strFileResult  = strResultFolder  & "\" & Replace(objFile.Name, ".html" , ".txt")
		strCMD = strExeFile & " " & strFileBase & " " & strFileCurrent & " 13 true 250  > "   & strFileResult
		
		objShell.Run strCmd,0,TRUE
	Next
End Function


If Err = 0 Then
  MsgBox "Task Completed"
Else 
  MsgBox  "Error Source: " & Err.Source & vbCrLf & " Error Description: " & Err.Description 
End If 

Set objShell = Nothing
Set objFSO   = Nothing

'MsgBox strCMD
'objShell.Run("%comspec% /K cacls.exe c:\scripts"), 1, True
'Some notes 
'If you do not specify the %comspec%  in front of the executable you are not getting the results file
'If you specify the %comspec% /K  in front of the executable you are getting only the first file will be executed.
             		
'Also, if bWaitOnReturn is set to True, then the script will suspend its execution until strCommand finishes. 
'The optional parameter intWindowStyle is used to set the window style of the program being run.

' To run this script, use the command prompt and type: cscript /nologo <name>.vbs