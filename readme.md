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
iptables -A INPUT -m multiport --dport 853 -j dnsblok
iptables -A DOCKER-USER -m multiport --dport 53 -j dnsblok
```

## Sudo

```
dnswhitelist ALL = NOPASSWD: /sbin/iptables
```
