<!-- This will flush and edit DOCKER-USER table!! -->

# Setting up

```shell
useradd dnswhitelist
mkdir /srv/dnswhitelist
cd /srv/dnswhitelist
git clone https://github.com/thegamerx1/PiHole-Whitelist/ .
npm i
systemctl enable dnswhitelist
service dnswhitelist start
```

## Iptables

```shell
iptables -N dnsblok
iptables -I INPUT -p tcp --dport 853 -j dnsblok
iptables -I INPUT -p udp --dport 853 -j dnsblok
iptables -I DOCKER-USER -p tcp --dport 53 -j dnsblok
iptables -I DOCKER-USER -p udp --dport 53 -j dnsblok
```

## Sudo

```
dnswhitelist ALL = NOPASSWD: /sbin/iptables
```
