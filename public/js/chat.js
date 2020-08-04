const socket = io()

const $messageForm = document.querySelector('#messageForm')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#sendLocation')
const $messages = document.querySelector('#messages')

//tempattes
const messageTemplate = document.querySelector('#messageTemplate').innerHTML
const locationMessageTemplate = document.querySelector('#locationMessageTemplate').innerHTML
const sidebarTemplate = document.querySelector('#sidebarTemplate').innerHTML

//options
const joinData = Qs.parse(location.search, {ignoreQueryPrefix: true})

const auttoScrolll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    const messageTime = new Date()
    const html = Mustache.render(messageTemplate,{
        message : message.text,
        createdAt: moment(message.createdAt).format('h:mm a'),
        username: message.username
    })
    $messages.insertAdjacentHTML('beforeend',html)
    auttoScrolll()
})
 
socket.on('locationMessage',(message)=>{
    const html = Mustache.render(locationMessageTemplate,{
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a'),
        username: message.username
    })
    $messages.insertAdjacentHTML('beforeend',html)
    auttoScrolll()
})

socket.on('roomData',(data)=>{
    const html = Mustache.render(sidebarTemplate, {
        room: data.room,
        users: data.users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const message = e.target.elements.message.value
    socket.emit('sendMessage',message, (error)=>{
        $messageFormButton.removeAttribute('disabled','disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error) {
            return console.log(error)
        }
        console.log('Message delivered')
    })
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation not supported by the browser')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        const myLocation = {}
        myLocation.latitude = position.coords.latitude
        myLocation.longitude = position.coords.longitude
        socket.emit('sendLocation',myLocation, (error)=>{
            $sendLocationButton.removeAttribute('disabled','disabled')
            if(error){
                console.log(error)
            }
            console.log('location delivered')
        })
    })
})

socket.emit('join',joinData, (error)=>{
    if(error){
        alert(error)
        location.href= '/'
    }
})