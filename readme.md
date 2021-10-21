This will flush and edit DOCKER-USER table!!

# Setting up

```shell
$ useradd dnswhitelist
$ mkdir /srv/dnswhitelist
$ cd /srv/dnswhitelist
$ git clone https://github.com/thegamerx1/PiHole-Whitelist/ .
$ npm i
$ systemctl enable dnswhitelist
$ service dnswhitelist start
```

in visudo:

```
dnswhitelist ALL = NOPASSWD: /sbin/iptables
```
