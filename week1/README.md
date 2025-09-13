chạy docker: docker-compose up --build -d

sau đó ssh vào: ssh -p 2222 user1@localhost

sau khi ssh vào:
sudo apt update
sudo apt install xfce4 tightvncserver

=> cài xfce và vnc server

sau đó chạy vncserver để đặt mật khẩu: vncserver :1
đặt mk xong tắt tạm đi: vncserver -kill :1

setup để khi kết nối vào vncserver sẽ mở xfce4:
echo "startxfce4 &" > ~/.vnc/xstartup
chmod +x ~/.vnc/xstartup

sau đó chạy vncserver:
vncserver :1 -geometry 1920x1080 -depth 24


sau khi xong mọi thứ sử dụng một cái vnc viewer của windows (ở đây em dùng TightVNC) để kết nối với localhost:5901