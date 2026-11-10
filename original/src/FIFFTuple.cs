using System;

namespace FIFFConsole
{
    public class FIFFTuple
    {
        public FIFFTuple(long t1, long t2, long t3)
        {
            T1 = t1; T2 = t2; T3 = t3;
        }

        public long T1 = FIFFConst.Undefined;
        public long T2 = FIFFConst.Undefined;
        public long T3 = FIFFConst.Undefined;
    }
}
