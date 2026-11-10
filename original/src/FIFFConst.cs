using System;

namespace FIFFConsole
{
    public class FIFFConst
    {
        public static long Undefined = -1;        
        public static char Delimiter = (char)32;
        public static bool Ordered = true;
        public static bool Optimized = true; 
        public static bool IgnoreCase = true; 
        public static string Format = "{0}1:{1} {2}{0}2:{3} {4}{0}"; // {0}NewLine, {1}f1Pos, {2}f1Diff, {3}f2Pos, {4}f2Diff 
        public static int Buffer = 4096;

        public static string Text()
        {
            string result = string.Empty;

            result += "\nDelimiter ASCII Code \t" + (Int32)FIFFConst.Delimiter;
            result += "\nOrdered Compare \t" + Text(FIFFConst.Ordered);
            result += "\nStream Buffer Size \t" + FIFFConst.Buffer;
            result += "\nOutput Format \t\t" + FIFFConst.Format;
            result += "\n\t\t\t\t{0} = New Line,";
            result += "\n\t\t\t\t{1} = file 1 position,";
            result += "\n\t\t\t\t{2} = file 1 difference,";
            result += "\n\t\t\t\t{3} = file 2 position,";
            result += "\n\t\t\t\t{4} = file 2 difference";
            result += "\n\t\t\t\t{5} = Configuration";
            result += "\nIgnore Case \t" + Text(FIFFConst.IgnoreCase);
            result += "\nOptimization \t" + Text(FIFFConst.Optimized);

            return result;
        }

        private static string Text(bool swtch)
        {
            return (swtch) ? "ON" : "OFF";
        }
    }
}
