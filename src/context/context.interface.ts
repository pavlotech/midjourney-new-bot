import { Context, Scenes } from "telegraf";

export interface SessionData {
};
export interface SceneData {

};

export interface ISceneContext extends Scenes.SceneContext {
  session: SceneData;
};

export interface IBotContext extends Context {
  scene: any;
  session: SessionData
};