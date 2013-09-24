# Reinvention

### Install at the web root or sub-domain, not in a sub-directory.

## Production Install

Tested on Linux version 2.6.18-028stab101.1 with Apache/2.2.22. Be sure mod_rewrite module is installed. htaccess file may need to be modified if app is not run from root directory.

### Using ssh and git

Clone repository into web directory and checkout stable branch.

```bash
cd /path/to/web
git clone https://github.com/MAP-Productions/Reinvention-Stories.git .
git checkout stable
```

Copy htaccess and index dist files.

```bash
cp .htaccess.dist .htaccess
cp index.html.dist index.html


## Setup


```bash
npm install
```

```bash
git submodule update --init --recursive
```

## Build Commands

```bash
bbb watch
```

```bash
bbb debug
```

```bash
bbb release
```

## Localize Video Resources

```bash
cd app/video && sudo chmod +x get.sh && ./get.sh
```



## Notes

Vendor deps:

- Bootstrap http://twitter.github.com/bootstrap
