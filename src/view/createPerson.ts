import { Container, Graphics, Text } from "pixi.js";

type CreatePersonOptions = {
  direction: "up" | "down";
  targetFloor: number;
  width: number;
  height: number;
  strokeWidth: number;
  upColor: string;
  downColor: string;
  fillColor: string;
  textColor: string;
  fontSize: number;
};

export function createPerson({
  direction,
  targetFloor,
  width,
  height,
  strokeWidth,
  upColor,
  downColor,
  fillColor,
  textColor,
  fontSize,
}: CreatePersonOptions): Container {
  const strokeColor = direction === "up" ? upColor : downColor;
  const personContainer = new Container();
  const personGraphics = new Graphics()
    .rect(0, 0, width, height)
    .fill(fillColor)
    .stroke({ width: strokeWidth, color: strokeColor });
  const personText = new Text({
    text: String(targetFloor),
    style: {
      fill: textColor,
      fontSize,
    },
  });

  personText.anchor.set(0.5);
  personText.x = width / 2;
  personText.y = height / 2;

  personContainer.addChild(personGraphics);
  personContainer.addChild(personText);

  return personContainer;
}
