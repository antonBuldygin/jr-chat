import express, { Request, Response } from "express";
import cors from "cors";

type Message = {
  "id": number,
  "username": string,
  "text": string,
  "timestamp": string,
};

const server = express();
const PORT = 4000;

const messages:Message[] = [];

function* infiniteSequence() {
  let i = 0;
  while (true) {
    yield ++i;
  }
}

const idIterator = infiniteSequence();

server.use(cors());
server.use(express.json());

server.get("/", function(req: Request, res: Response) {
  res.status(200).json("Hello from backend");
});

server.get("/messages", function(req: Request, res: Response) {
  res.status(200).json([...messages]);
});

server.post("/messages", function(req: Request, res: Response) {
  const { username, text } = req.body;

  // 2 Стратегии валидации
  //   1. Проверяются все ошибки и отправляются скопом
  //   2. Проверка останавливается на первой попавшейся ошибке и отправляется эта ошибка

  // *Некрасивенько, что в одном if проводятся сразу все проверки username
  // потому что сложно сформировать адекватное сообщение об ошибке
  if (typeof username !== "string" ) {
    res.status(400).send({
      message: "Incorrect username . Not a string",
    });
    return;
  }
  if ( username.length < 2 ) {
    res.status(400).send({
      message: "Incorrect username. username.length < 2",
    });
    return;
  }

  if (username.length > 50) {
    res.status(400).send({
      message: "Incorrect username. username.length > 50",
    });
    return;
  }

  if (typeof text !== "string" ) {
    res.status(400).send({
      message: "Incorrect message text. Not a string",
    });
    return;
  }

  if ( text.length < 1 ) {
    res.status(400).send({
      message: "Incorrect message text.text.length < 1",
    });
    return;
  }
  if (text.length > 500) {
    res.status(400).send({
      message: "Incorrect message text.text.length > 500",
    });
    return;
  }

  const newMessage = {
    id: idIterator.next().value as number,
    text,
    timestamp: new Date().toISOString(),
    username,
  };

  messages.push(newMessage);
  res.status(201).send(newMessage);
});

server.listen(PORT, function() {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});