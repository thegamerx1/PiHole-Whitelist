# Setting up

iptables -I DOCKER-USER -p tcp --dport 53 -j DROP
iptables -I DOCKER-USER -p udp --dport 53 -j DROP
iptables-save > /etc/iptables/rules.v4
