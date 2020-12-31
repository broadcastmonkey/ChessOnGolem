namespace AsciiChesboardViewer
{
    partial class Form1
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.BtnNext = new System.Windows.Forms.Button();
            this.TxtChessboard = new System.Windows.Forms.TextBox();
            this.BrnPrev = new System.Windows.Forms.Button();
            this.ListChessboardFiles = new System.Windows.Forms.ListBox();
            this.LblChessPiecesWhite = new System.Windows.Forms.Label();
            this.LblChessPiecesBlack = new System.Windows.Forms.Label();
            this.LblMove = new System.Windows.Forms.Label();
            this.SuspendLayout();
            // 
            // BtnNext
            // 
            this.BtnNext.Location = new System.Drawing.Point(441, 458);
            this.BtnNext.Name = "BtnNext";
            this.BtnNext.Size = new System.Drawing.Size(75, 23);
            this.BtnNext.TabIndex = 0;
            this.BtnNext.Text = "button1";
            this.BtnNext.UseVisualStyleBackColor = true;
            this.BtnNext.Visible = false;
            this.BtnNext.Click += new System.EventHandler(this.BtnNext_Click);
            // 
            // TxtChessboard
            // 
            this.TxtChessboard.Font = new System.Drawing.Font("Consolas", 20F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(254)));
            this.TxtChessboard.Location = new System.Drawing.Point(12, 12);
            this.TxtChessboard.Multiline = true;
            this.TxtChessboard.Name = "TxtChessboard";
            this.TxtChessboard.Size = new System.Drawing.Size(504, 440);
            this.TxtChessboard.TabIndex = 1;
            // 
            // BrnPrev
            // 
            this.BrnPrev.Location = new System.Drawing.Point(12, 458);
            this.BrnPrev.Name = "BrnPrev";
            this.BrnPrev.Size = new System.Drawing.Size(75, 23);
            this.BrnPrev.TabIndex = 2;
            this.BrnPrev.Text = "button2";
            this.BrnPrev.UseVisualStyleBackColor = true;
            this.BrnPrev.Visible = false;
            // 
            // ListChessboardFiles
            // 
            this.ListChessboardFiles.FormattingEnabled = true;
            this.ListChessboardFiles.Location = new System.Drawing.Point(522, 12);
            this.ListChessboardFiles.Name = "ListChessboardFiles";
            this.ListChessboardFiles.Size = new System.Drawing.Size(152, 433);
            this.ListChessboardFiles.TabIndex = 3;
            this.ListChessboardFiles.SelectedIndexChanged += new System.EventHandler(this.ListChessboardFiles_SelectedIndexChanged);
            // 
            // LblChessPiecesWhite
            // 
            this.LblChessPiecesWhite.AutoSize = true;
            this.LblChessPiecesWhite.Font = new System.Drawing.Font("Microsoft Sans Serif", 30F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(254)));
            this.LblChessPiecesWhite.Location = new System.Drawing.Point(125, 458);
            this.LblChessPiecesWhite.Name = "LblChessPiecesWhite";
            this.LblChessPiecesWhite.Size = new System.Drawing.Size(126, 46);
            this.LblChessPiecesWhite.TabIndex = 4;
            this.LblChessPiecesWhite.Text = "label1";
            // 
            // LblChessPiecesBlack
            // 
            this.LblChessPiecesBlack.AutoSize = true;
            this.LblChessPiecesBlack.Font = new System.Drawing.Font("Microsoft Sans Serif", 30F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(254)));
            this.LblChessPiecesBlack.Location = new System.Drawing.Point(268, 458);
            this.LblChessPiecesBlack.Name = "LblChessPiecesBlack";
            this.LblChessPiecesBlack.Size = new System.Drawing.Size(126, 46);
            this.LblChessPiecesBlack.TabIndex = 5;
            this.LblChessPiecesBlack.Text = "label2";
            // 
            // LblMove
            // 
            this.LblMove.AutoSize = true;
            this.LblMove.Font = new System.Drawing.Font("Microsoft Sans Serif", 30F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(254)));
            this.LblMove.Location = new System.Drawing.Point(533, 458);
            this.LblMove.Name = "LblMove";
            this.LblMove.Size = new System.Drawing.Size(126, 46);
            this.LblMove.TabIndex = 6;
            this.LblMove.Text = "label1";
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(715, 521);
            this.Controls.Add(this.LblMove);
            this.Controls.Add(this.LblChessPiecesBlack);
            this.Controls.Add(this.LblChessPiecesWhite);
            this.Controls.Add(this.ListChessboardFiles);
            this.Controls.Add(this.BrnPrev);
            this.Controls.Add(this.TxtChessboard);
            this.Controls.Add(this.BtnNext);
            this.Name = "Form1";
            this.Text = "Chess on Golem  //  chessboard viewer";
            this.Load += new System.EventHandler(this.Form1_Load);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button BtnNext;
        private System.Windows.Forms.TextBox TxtChessboard;
        private System.Windows.Forms.Button BrnPrev;
        private System.Windows.Forms.ListBox ListChessboardFiles;
        private System.Windows.Forms.Label LblChessPiecesWhite;
        private System.Windows.Forms.Label LblChessPiecesBlack;
        private System.Windows.Forms.Label LblMove;
    }
}

