# Microsserviço Websocket

Esse microserviço facilita a comunicação e conexão entre dois ou mais clientes para que possam interagir no mesmo projeto em tempo real.

### | Uso

Todo o projeto é desenvolvido em TypeScript e compilado para JavaScript.

Utilize o comando ``npm install`` para instalar todas as dependências.

Em ambiente de desenvolvimento utilize o comando ``npm run start:dev``.

Quando quiser compilar para rodar em ambiente de produção ou homologação utilize esse comando ``npm run build``. A saída da compilação vai para a pasta ``dist``.

### | Node

A versão do node utilizada é ``v22.13.1``, que é uma versão LTS.

### | Dependências

- @types/cors: ^2.8.19
- @types/express: ^5.0.3
- cors: ^2.8.5
- express: ^5.1.0
- http: ^0.0.1-security
- socket.io: ^4.8.1
- typescript: ^5.9.2

Nota: O pacote socket.io é necessário no front-end para completar a conexão Websocket.

### | Dependências para ambiente de desenvolvimento

- esbuild: ^0.25.10
- nodemon: ^3.1.10
- ts-node: ^10.9.2

### | Descrição de funcionalidade

Os clientes estabelecem conexão e verificam se já há uma sala aberta. Caso não exista, significa que não há ninguém online e, então, o cliente abre a sala. Porém, se já houver uma sala aberta, o cliente apenas entra nela. O que vale é sempre a primeira conexão, e a sala não fecha caso quem a abriu saia; ela só é fechada se ficar sem pessoas.