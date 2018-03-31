# Docker-ssh

Docker-shh is a lightweight ssh server to access remote docker containers. It provides easy access using public keys without need to create a real user on the server. It can run in a container.
Built with ssh2 + dockerode + node <3

## Usage: 

- Make a private key an place it in the config folder of docker-ssh named id_rsa
- Create a file named *authorized_keys* in the config folder with public keys of users allowed to access containers. 1 key per line
- Run: *docker-compose up* 

## Access:
ssh -t \<host> -p \<port> \<command> \<container> \<exec>

**Example:**
 ssh -t localhost -p 2222 exec container_1 bash

### Methods:
exec \<container> \<exec>

logs \<container>

### Env variables:
- AUTHORIZED_KEYS_FILE
  - Name of the file with public keys for authentication. 
  - **Default**: authorized_keys

- SERVER_KEY
  - Name of the file with private key of the server.
  - **Default**: id_rsa
- SSH_PORT
	-  Port to access ssh
	- **Default**: 2222
- SSH_HOST
	- Bind host address
	- **Default**: 0.0.0.0


## Todo:
- Complete access to docker API
- User level.
- Tests
