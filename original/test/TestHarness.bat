@ECHO OFF

SET APP=C:\BLUE\Sandbox\C#\FIFFConsole\bin\Debug\FIFFConsole.exe

SET D=C:\BLUE\Sandbox\C#\FIFFConsole\test\
SET F1=This is a text.txt
SET F1a=Copy of This is a text.txt
SET F2=This is a simple text.txt
SET F3=This is a complex text.txt
SET F4=This is a simple text, right.txt
SET F5=This is a text simple.txt
SET F6=This is convoluted text that my sister wrote.txt
SET F7=This text is in red.txt
SET F8=This is a complex convoluted text.txt
SET F9=I like ice-cream.txt

SET X1=T1.xml
SET X1a=copy of T1.xml
SET X2=T2.xml
SET X3=T3.xml

SET G1=grid1.html
SET G2=grid2.html

REM ECHO "%D%%F1%"

CALL "%APP%" "%D%%F1%" "%D%%F1%"
PAUSE

CALL "%APP%" "%D%%F1%" "%D%%F1a%"
PAUSE

CALL "%APP%" "%D%%X1%" "%D%%X1a%"
PAUSE

CALL FIFFConsoleTestHarness "%APP%" "%D%%F1%" "%D%%F2%"
REM CALL FIFFConsoleTestHarness "%APP%" "%D%%F2%" "%D%%F1%"
PAUSE

CALL FIFFConsoleTestHarness "%APP%" "%D%%F1%" "%D%%F5%"
REM CALL FIFFConsoleTestHarness "%APP%" "%D%%F5%" "%D%%F1%"
PAUSE

CALL FIFFConsoleTestHarness "%APP%" "%D%%F2%" "%D%%F5%"
REM CALL FIFFConsoleTestHarness "%APP%" "%D%%F5%" "%D%%F2%"
PAUSE

CALL FIFFConsoleTestHarness "%APP%" "%D%%F2%" "%D%%F3%"
REM CALL FIFFConsoleTestHarness "%APP%" "%D%%F3%" "%D%%F2%"
PAUSE

CALL FIFFConsoleTestHarness "%APP%" "%D%%F1%" "%D%%F6%"
REM CALL FIFFConsoleTestHarness "%APP%" "%D%%F6%" "%D%%F1%"
PAUSE

CALL FIFFConsoleTestHarness "%APP%" "%D%%F1%" "%D%%F7%"
REM CALL FIFFConsoleTestHarness "%APP%" "%D%%F7%" "%D%%F1%"
PAUSE

CALL FIFFConsoleTestHarness "%APP%" "%D%%F8%" "%D%%F6%"
REM CALL FIFFConsoleTestHarness "%APP%" "%D%%F6%" "%D%%F8%"
PAUSE

REM THE OFFICIAL COMPETITION TEST
CALL "%APP%" "%D%%G1%" "%D%%G2%" 13 true 200
PAUSE

REM CALL FIFFConsoleTestHarness "%APP%" "%D%%X1%" "%D%%X2%"
REM PAUSE

REM CALL FIFFConsoleTestHarness "%APP%" "%D%%X1%" "%D%%X3%"
REM PAUSE

REM CALL FIFFConsoleTestHarness "%APP%" "%D%%X2%" "%D%%X3%"
REM PAUSE
