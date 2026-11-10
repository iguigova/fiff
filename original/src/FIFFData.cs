using System;
using System.Collections.Generic;

namespace FIFFConsole
{
    public interface IFIFFData
    {
        int Count { get; }

        void Add(object pos, object hash, object len);
        int IndexOf(object hash);
        object PeekPosAt(int idx);
        object PeekHashAt(int idx);
        object PeekLenAt(int idx);
        object PeekEndAt(int idx);
        void RemoveAt(int idx);
        void RemoveRange(int idx, int cnt); 
        void Clear();
    }

    public class FIFFData : IFIFFData
    {
        private List<FIFFTuple> tuples = new List<FIFFTuple>();

        public int Count
        {
            get { return tuples.Count; }
        }

        public void Add(object pos, object hash, object len)
        {
            tuples.Add(new FIFFTuple(Convert.ToInt64(pos), Convert.ToInt64(hash), Convert.ToInt64(len)));
        }

        public int IndexOf(object hash)
        {
            for (int i = 0; i < Count; i++)
            {
                if (tuples[i].T2 == Convert.ToInt64(hash))
                {
                    return i;
                }
            }
            return (int)FIFFConst.Undefined;
        }

        public object PeekPosAt(int idx)
        {
            long result = FIFFConst.Undefined;

            if ((idx > (int)FIFFConst.Undefined) && (idx < Count))
            {
                result = tuples[idx].T1;
            }
            return result;
        }

        public object PeekHashAt(int idx)
        {
            long result = FIFFConst.Undefined;

            if ((idx > (int)FIFFConst.Undefined) && (idx < Count))
            {
                result = tuples[idx].T2;
            }
            return result;
        }

        public object PeekLenAt(int idx)
        {
            long result = FIFFConst.Undefined;

            if ((idx > (int)FIFFConst.Undefined) && (idx < Count))
            {
                result = tuples[idx].T3;
            }
            return result;
        }

        public object PeekEndAt(int idx)
        {
            long result = FIFFConst.Undefined;

            if ((idx > (int)FIFFConst.Undefined) && (idx < Count))
            {
                result = tuples[idx].T1 + tuples[idx].T3;
            }
            return result;
        }

        public void RemoveAt(int idx)
        {
            if ((idx > (int)FIFFConst.Undefined) && (idx < Count))
            {
                tuples.RemoveAt(idx);
            }
        }

        public void RemoveRange(int idx, int cnt)
        {
            if ((idx > (int)FIFFConst.Undefined) && (idx < Count))
            {
                tuples.RemoveRange(idx, Math.Min(cnt, Count - idx));
            }
        }

        public void Clear()
        {
            tuples.Clear();
        }
    }
}
