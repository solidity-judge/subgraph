import { CreateGate } from "../../generated/UserGateFactory/UserGateFactory";
import { User } from "../../generated/schema";
import { setMetaDataFields, setSyncingIndex } from "../helper";


export function handleCreateGate(event: CreateGate): void {
  let user = new User(event.params.username);
  user.gate = event.params.gate.toHexString();
  user.user = event.params.user.toHexString();
  setMetaDataFields(user, event);
  setSyncingIndex("users", user);
  user.save();
}
