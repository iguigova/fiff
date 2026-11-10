using System;

namespace FIFFConsole
{
    public class FIFFBroker<TFIFFStream, TFIFFData> 
        where TFIFFStream: IFIFFStream, new() 
        where TFIFFData: IFIFFData, new()
    {
        private IFIFFStream stream1 = new TFIFFStream();
        private IFIFFStream stream2 = new TFIFFStream();
        private IFIFFData data1 = new TFIFFData();
        private IFIFFData data2 = new TFIFFData();
        private string diff = string.Empty;
        private int diffCount = 0;

        // Reads tokens from the file stream into the data buffer
        // where 
        // @pos: indicates the starting read (i.e. from) position in the file stream
        // @optimized: indicates how many tokens to read in (true -> 1, false -> all, defaults to true)
        protected void ReadIn(IFIFFStream stream, IFIFFData data, long pos, bool optimized)
        {
            bool readnext = (pos >= 0) && (pos < stream.Last);
            while (readnext)
            {
                data.Add(pos, stream.Read(pos, FIFFConst.Delimiter).GetHashCode(), stream.Next - stream.Prev);
                readnext = (stream.NEOF) && !optimized;
                pos = stream.Next;
            }
        }

        // Reads text from the file stream for the 0..index tokens and removes them from the data buffer
        // where
        // @idx: indicates the last data token to be read out
        // @reposition: indicates the ending read (i.e. to) position in the file stream
        protected string ReadOut(IFIFFStream stream, IFIFFData data, int idx, long reposition)
        {
            string result = string.Empty;

            idx = Math.Min(idx, data.Count - 1);
            if (idx > FIFFConst.Undefined)
            {
                result = stream.Read((long)data.PeekPosAt(0), (long)data.PeekPosAt(idx) + (long)data.PeekLenAt(idx));
            }

            if (reposition > FIFFConst.Undefined)
                stream.Read(reposition, 0);

            if (FIFFConst.Ordered && FIFFConst.Optimized)
            {
                data.Clear();
            }
            else
            {
                data.RemoveRange(0, idx + 1);
            }

            return result;
        }

        protected int Reindex(int idx)
        {
            return (FIFFConst.Ordered) ? idx : 0;
        }

        protected long Reposition(IFIFFStream stream, long pos)
        {
            return (FIFFConst.Ordered) ? pos : stream.Last;
        }

        // Reports the text difference between file1 0..idx1 tokens and file2 0..idx2 tokens
        protected void Report(int idx1, int idx2)
        {
            long pos1 = (long)data1.PeekPosAt(0);
            long pos2 = (long)data2.PeekPosAt(0);

            int offset = ((long)data1.PeekHashAt(idx1) == (long)data2.PeekHashAt(idx2)) ? -1 : 0;

            string diff1 = ReadOut(stream1, data1, Reindex(idx1 + offset), Reposition(stream1, (long)data1.PeekEndAt(idx1)));
            string diff2 = ReadOut(stream2, data2, Reindex(idx2 + offset), Reposition(stream2, (long)data2.PeekEndAt(idx2)));

            if (string.Compare(diff1, diff2, FIFFConst.IgnoreCase) != 0)
            {
                diff += string.Format(FIFFConst.Format, Environment.NewLine, pos1, diff1, pos2, diff2, FIFFConst.Text());
                diffCount++;
            }
        }

        protected int Process(int idx1, int idx2, bool matched)
        {            
            var NEOF = stream1.NEOF && stream2.NEOF;
            var EOF = (FIFFConst.Ordered && FIFFConst.Optimized && !NEOF);

            if (!(FIFFConst.Ordered || matched) || (FIFFConst.Ordered && matched && (idx1 + idx2 > 0)))
            {
                // report difference
                Report(idx1, idx2);
            }
            else
            {
                if (matched)
                {
                    // remove matching pair
                    data1.RemoveAt(idx1);
                    data2.RemoveAt(idx2);
                }

                if (FIFFConst.Ordered && FIFFConst.Optimized)
                {
                    // read next pair                
                    ReadIn(stream1, data1, stream1.Next, NEOF);
                    ReadIn(stream2, data2, stream2.Next, NEOF);
                }
            }

            if (((data1.Count == 0) && (data2.Count > 0)) || ((data2.Count == 0) && (data1.Count > 0)) || EOF)
            {
                // finilize difference
                Report(data1.Count, data2.Count);
            }

            return (matched || !FIFFConst.Ordered) ? 0 : Math.Min(idx1, idx2) + 1;
        }

        protected void Process()
        {
            int idx = 0;

            while ((data1.Count + data2.Count > 0))
            {
                int match1 = data1.IndexOf(data2.PeekHashAt(idx));
                int match2 = data2.IndexOf(data1.PeekHashAt(idx));

                if (!FIFFConst.Ordered && (match1 + match2 > idx)) // idx = 0
                {
                    idx = Process(
                        Process(match1, idx, true), 
                        data2.IndexOf(data1.PeekHashAt(idx)), 
                        true);
                }
                else
                {
                    idx = Process(
                        ((match1 > FIFFConst.Undefined) && (match2 == FIFFConst.Undefined)) ? match1 : idx,
                        ((match2 > FIFFConst.Undefined) && (match1 == FIFFConst.Undefined)) ? match2 : idx,
                        (match1 + match2 >= FIFFConst.Undefined));
                }
            }
        }

        public string Compare(string filename1, string filename2)
        {
            if (filename1 != filename2)
            {
                stream1.Open(filename1);
                stream2.Open(filename2);
                try
                {
                    if (stream1.Hash != stream2.Hash)
                    {
                        while (stream1.NEOF || stream2.NEOF)
                        {
                            if (stream1.Read(stream1.Next, stream1.Next + FIFFConst.Buffer).GetHashCode() != stream2.Read(stream2.Next, stream2.Next + FIFFConst.Buffer).GetHashCode())
                            {
                                ReadIn(stream1, data1, stream1.Prev, FIFFConst.Ordered & FIFFConst.Optimized);
                                ReadIn(stream2, data2, stream2.Prev, FIFFConst.Ordered & FIFFConst.Optimized);

                                Process();
                            }
                        }
                    }
                }
                finally
                {
                    stream1.Close();
                    stream2.Close();
                }
            }

            return diff + string.Format("{0}{0}Total number of differences: {1}", Environment.NewLine, diffCount); 
        }
    }
}
