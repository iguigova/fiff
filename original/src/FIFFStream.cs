using System;
using System.IO;
using System.Text;

namespace FIFFConsole
{
    public interface IFIFFStream
    {
        bool EOF { get; }
        bool NEOF { get; }
        long Prev { get; }
        long Next { get; }
        long Last { get; }
        long Hash { get; }

        void Open(string filename);
        string Read(long from, long to);
        string Read(long from, char to);
        void Close();
    }

    public class FIFFStream: IFIFFStream
    {
        private FileStream stream = null;
        private long prev = FIFFConst.Undefined;
        private UTF8Encoding encoding = new UTF8Encoding(true);

        public bool EOF
        {
            get { return Next >= Last; }
        }
        
        public bool NEOF
        {
            get { return Next < Last; }
        }

        public long Prev
        {
            get { return prev; } 
        }

        public long Next
        {
            get { return (stream != null) ? stream.Position : FIFFConst.Undefined; }
        }

        public long Last
        {
            get { return (stream != null) ? stream.Length : FIFFConst.Undefined; }
        }

        public long Hash
        {
            get { return (stream != null) ? stream.GetHashCode() : FIFFConst.Undefined; }
        }

        public void Open(string filename) 
        {
            Close(); 
            //http://msdn.microsoft.com/en-us/library/7db28s3c.aspx
            stream = new FileStream(filename, FileMode.Open, FileAccess.Read, FileShare.Read, FIFFConst.Buffer, false);
        }

        public byte[] ReadBytes(long from, long to)
        {
            if ((from > FIFFConst.Undefined) && (from != Next))
            {
                // http://msdn.microsoft.com/en-us/library/system.io.filestream.seek.aspx
                // Seeking to any location beyond the length of the stream is supported. 
                // When you seek beyond the length of the file, the file size grows.
                stream.Seek(Math.Min(from, Last), SeekOrigin.Begin);
            }

            byte[] b = new byte[Math.Min(Math.Max(0, to - Next), Math.Max(0, Last - Next))];
            if ((Next < Last))
            {
                prev = Next;                
                stream.Read(b, 0, b.Length);
            }

            return b;
        }

        public string Read(long from, long to)
        {           
            return encoding.GetString(ReadBytes(from, to));
        }

        public string Read(long from, char to)
        {
            string result = string.Empty; 

            byte[] b = ReadBytes(from, 0);

            bool EOT = false;
            while (!EOT)
            {                
                b = ReadBytes(Next, Next + 1);

                EOT = (b.Length == 0);
                if (b.Length > 0)
                {
                    result += encoding.GetString(b);
                    EOT = EOT || result[result.Length -1] == to || result.EndsWith(Environment.NewLine);
                }
            }

            prev = Math.Min(from, Last); 
            return result;
        }

        public void Close()
        {
            if (stream != null)
                stream.Close();
            stream = null; 
        }
    }
}
