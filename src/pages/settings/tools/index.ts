import { checkemails, match_email, SettingsDB } from "../../../tools";

enum Responce {
    regex="regex",
    valid="valid",
    not_valid="not_valid"
}
class Settings {
    constructor(){
      SettingsDB.load().then(()=>{
        console.log("settings database is loaded");
      })
    }
    /***
     * @email string // sender email 
    //  * */
    // async setSender(email: string){
    //     if(!match_email(email).status) return { status: false, reason: Responce.regex }
    //     let checking = await checkemails({ emails:[email], });
    //     if(checking && checking[0].status){
    //         SettingsDB.set("sender_email", email);
    //         SettingsDB.save()
    //         return { status: true, reason: Responce.valid }
    //     } else {
    //         return { status: false, reason: Responce.not_valid }
    //     }
    // }
}
export {Responce}
export default Settings