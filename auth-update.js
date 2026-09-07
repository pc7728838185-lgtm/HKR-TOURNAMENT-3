/* HKR Tournaments V3 authentication enhancement */
(function(){
"use strict";
const C=window.HKR_CONFIG||{}; let sb=null;
const $=s=>document.querySelector(s);
function toast(m){const t=$("#toast");if(!t)return;t.textContent=m;t.style.display="block";clearTimeout(window.__hkrT);window.__hkrT=setTimeout(()=>t.style.display="none",2600)}
function redirectUrl(){return location.origin+location.pathname}
function client(){if(sb)return sb;if(!window.supabase||!C.SUPABASE_URL||!C.SUPABASE_PUBLISHABLE_KEY){toast("Supabase configuration is missing.");return null}sb=window.supabase.createClient(C.SUPABASE_URL,C.SUPABASE_PUBLISHABLE_KEY);return sb}
function modal(html){$("#modalContent").innerHTML=html;$("#modal").classList.remove("hidden")}
function close(){ $("#modal").classList.add("hidden") }

function login(){
modal(`<h2>Login</h2><form id="hkrLogin"><label>Email</label><input id="email" type="email" required autocomplete="email" placeholder="you@example.com"><label>Password</label><input id="password" type="password" required autocomplete="current-password"><button class="btn" type="submit">Login</button></form><div class="auth-actions"><button class="auth-link" id="forgot">Forgot password?</button><button class="auth-link" id="signup">Create a new account</button></div>`);
$("#hkrLogin").onsubmit=async e=>{e.preventDefault();const s=client();if(!s)return;const {error}=await s.auth.signInWithPassword({email:$("#email").value.trim(),password:$("#password").value});if(error)return toast(error.message);close();toast("Login successful.");if(window.loadSession)window.loadSession()};
$("#forgot").onclick=forgot;$("#signup").onclick=signup
}
function signup(){
modal(`<h2>Create account</h2><form id="hkrSignup"><label>Player name</label><input id="name" maxlength="60" required autocomplete="nickname" placeholder="Your player name"><label>Email</label><input id="email" type="email" required autocomplete="email"><label>Password</label><input id="password" type="password" minlength="6" required autocomplete="new-password"><button class="btn" type="submit">Sign up</button></form><div class="auth-actions"><button class="auth-link" id="back">Already have an account? Login</button></div><div class="auth-note">If email confirmation is enabled, check your email before logging in.</div>`);
$("#hkrSignup").onsubmit=async e=>{e.preventDefault();const s=client();if(!s)return;const name=$("#name").value.trim(),email=$("#email").value.trim(),password=$("#password").value;const {data,error}=await s.auth.signUp({email,password,options:{data:{player_name:name,full_name:name}}});if(error)return toast(error.message);if(data.session){close();toast("Account created.");if(window.loadSession)window.loadSession()}else{toast("Account created. Check your email.");setTimeout(login,700)}};
$("#back").onclick=login
}
function forgot(){
modal(`<h2>Reset password</h2><p>Enter your account email to receive a reset link.</p><form id="hkrForgot"><label>Email</label><input id="email" type="email" required autocomplete="email"><button class="btn" type="submit">Send reset link</button></form><div class="auth-actions"><button class="auth-link" id="back">Back to login</button></div>`);
$("#hkrForgot").onsubmit=async e=>{e.preventDefault();const s=client();if(!s)return;const {error}=await s.auth.resetPasswordForEmail($("#email").value.trim(),{redirectTo:redirectUrl()});if(error)return toast(error.message);toast("Reset link sent. Check your email.");setTimeout(login,700)};
$("#back").onclick=login
}
function reset(){
modal(`<h2>Set new password</h2><p>Choose a new password.</p><form id="hkrReset"><label>New password</label><input id="p1" type="password" minlength="6" required autocomplete="new-password"><label>Confirm password</label><input id="p2" type="password" minlength="6" required autocomplete="new-password"><button class="btn" type="submit">Update password</button></form>`);
$("#hkrReset").onsubmit=async e=>{e.preventDefault();if($("#p1").value!==$("#p2").value)return toast("Passwords do not match.");const s=client();if(!s)return;const {error}=await s.auth.updateUser({password:$("#p1").value});if(error)return toast(error.message);close();toast("Password updated successfully.")};
}
function install(){
const b=$("#authBtn"); if(b)b.onclick=async()=>{const s=client();if(!s)return;const {data}=await s.auth.getSession();if(data.session){await s.auth.signOut();toast("Signed out.");if(window.loadSession)window.loadSession()}else login()};
const c=$("#closeModal");if(c)c.onclick=close;
const s=client();if(!s)return;
s.auth.onAuthStateChange((event)=>{if(event==="PASSWORD_RECOVERY")setTimeout(reset,0);else if(event==="SIGNED_IN"||event==="SIGNED_OUT")setTimeout(()=>window.loadSession&&window.loadSession(),0)});
s.auth.getSession().then(({data})=>{if(data.session&&/type=recovery/i.test(location.hash))setTimeout(reset,0)});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install);else install();
window.HKRAuth={login,signup,forgot,reset};
})();