import { Abortable } from "events";
import internal from "stream";
import { Context, Scenes } from "telegraf";

export interface SessionData {
  task_id: string;
};
export interface SceneData {

};

export interface ISceneContext extends Scenes.SceneContext {
  session: SceneData;
};

export interface IBotContext extends Context {
  session: SessionData;
  scene: any;
};