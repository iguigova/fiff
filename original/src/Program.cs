using System;
using System.Diagnostics;

namespace FIFFConsole
{
    class Program
    {
        static void Main(string[] args)
        {
            // Test if input arguments were supplied:
            if ((args.Length < 2) || (args.Length > 6))
            {
                Console.WriteLine("\nPlease enter the names of the files to compare.");
                Console.WriteLine("\nUsage: FIFFConsole <filename1> <filename2> [<delimiterchar> [<ordered> [<buffer> [<format>]]]]");
                Console.WriteLine();
                Console.WriteLine(FIFFConst.Text());
                return ;
            }

            // Set if optional arguments were supplied, ignore if incorrect: 
            try
            {
                FIFFConst.Delimiter = (char)Int32.Parse(args[2]);
                FIFFConst.Ordered = Convert.ToBoolean(args[3]);
                FIFFConst.Buffer = Int32.Parse(args[4]);
                FIFFConst.Format = args[5];
            }
            catch { }

            try
            {
                Process FIFFProcess = Process.GetCurrentProcess();
                FIFFProcess.Refresh();
                long startPeakWorkingSet64 = FIFFProcess.PeakWorkingSet64;
                long startPeakPagedMemorySize64 = FIFFProcess.PeakPagedMemorySize64;
                long startPeakVirtualMemorySize64 = FIFFProcess.PeakVirtualMemorySize64;

                Stopwatch stopWatch = new Stopwatch(); // DateTime startTime = DateTime.Now;
                stopWatch.Start();

                Console.WriteLine("Comparing " + args[0] + " to " + args[1] + "...");

                FIFFBroker<FIFFStream, FIFFData> broker = new FIFFBroker<FIFFStream, FIFFData>();
                Console.Write(broker.Compare(args[0], args[1]));

                stopWatch.Stop();
                Console.WriteLine();
                Console.WriteLine(stopWatch.Elapsed); //Console.WriteLine(new TimeSpan(DateTime.Now.Ticks - startTime.Ticks));

                FIFFProcess.Refresh();
                Console.WriteLine();
                Console.WriteLine("Delta peak physical memory usage: {0}", FIFFProcess.PeakWorkingSet64 - startPeakWorkingSet64);
                Console.WriteLine("Delta peak paged memory usage: {0}", FIFFProcess.PeakPagedMemorySize64 - startPeakPagedMemorySize64);
                Console.WriteLine("Delta peak virtual memory usage: {0}", FIFFProcess.PeakVirtualMemorySize64 - startPeakVirtualMemorySize64);
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message);
            }
        }
    }
}
