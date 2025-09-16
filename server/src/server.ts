import dnode from "dnode";

const server = dnode({
  add: (a: number, b: number, cb: (res: number) => void) => cb(a + b),
});

server.listen(5004);