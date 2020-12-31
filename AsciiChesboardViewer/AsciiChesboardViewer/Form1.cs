using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace AsciiChesboardViewer
{
    public partial class Form1 : Form
    {
        String PATH = @"D:\js\chess_on_golem\node_chess_app\chess\tmp\game_127\input";
        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            var files = System.IO.Directory.GetFiles(PATH).ToList().Where(x => x.Contains("chessboard_")).ToList();

            files.ForEach(x => ListChessboardFiles.Items.Add(x));
        }

        private void BtnNext_Click(object sender, EventArgs e)
        {
            
        }

        private void ListChessboardFiles_SelectedIndexChanged(object sender, EventArgs e)
        {
            LblMove.Text = (ListChessboardFiles.SelectedIndex + 1).ToString();
            TxtChessboard.Text = System.IO.File.ReadAllText(ListChessboardFiles.SelectedItem.ToString()).Replace("\n","\r\n");

            Dictionary<char, int> ValueMap = new Dictionary<char, int>();
            ValueMap.Add('p', 1);
            ValueMap.Add('b', 3);
            ValueMap.Add('n', 3);
            ValueMap.Add('r', 6);
            ValueMap.Add('q', 9);

            int white = 0;
            int black = 0;

            foreach (char c in TxtChessboard.Text.Replace("a  b  c  d  e  f  g  h",""))
            {
                if(ValueMap.ContainsKey(char.ToLower(c)))
                {
                    if (char.IsLower(c))
                        black += ValueMap[char.ToLower(c)];
                    else 
                        white += ValueMap[char.ToLower(c)];
                }   
            }
            LblChessPiecesBlack.Text = black.ToString();
            LblChessPiecesWhite.Text = white.ToString();
        }
    }
}
