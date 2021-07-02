/**
 * Sistema de marcação de imagens 2D
 * @author Nelia Cantanhede Reis <neliakings@gmail.com>
 * @version 0.1
 */


var mode = ""
var imageLoaded = null
var waterPipeLines = []
var listOfSegments = []
var waterPipePoints = []
var currentListOfPoints = []
var drawingModeEl = $('drawing-mode')


/**
 * Classe responsável pela manipulação dos objetos no canvas
 */
class Canvas {
    
    /**
     * Inicializa o elemento canvas
     * @param {String} id id atribuído ao canvas no html
     * @param {any} canvasConfigurations configurações do canvas
     */
    constructor(id, canvasConfigurations) {
        this.canvas = new fabric.Canvas(id, canvasConfigurations)
    }

    /**
     * Renderiza o canvas
     */
    render() {
        this.canvas.renderAll()
    }

    /**
     * Desenha os pontos com as linhas no canvas
     * @param {Number} x coordenada x do ponto
     * @param {Number} y coordenada y do ponto
     */
    drawPoint(x, y) {
        // Adicione um pequeno círculo como um ponto indicativo
        var newPoint = new fabric.Circle({
            radius: 5,
            fill: "red",
            left: x,
            top: y,
            selectable: false,
            originX: "center",
            originY: "center",
            hoverCursor: "auto",
            lineToPrevious: undefined,
            lineToNext: undefined,
            hasControls: false,
            hasBorders: false
        });

        // Recuperando o Index do ultimo elemento
        var lastPointAddedIndex = currentListOfPoints.length - 1

        // Se tiver mais de um ponto
        if(lastPointAddedIndex >= 0) {
            var previousPoint = currentListOfPoints[lastPointAddedIndex]

            // Ignora pontos duplicados 
            if(previousPoint.left == x && previousPoint.top == y) return;

            // Adiciona linha
            var line = new fabric.Line(
                [previousPoint.get("left"), previousPoint.get("top"), newPoint.get("left"), newPoint.get("top")],
                // configurações da linha
                {
                    stroke: "blue",
                    strokeWidth: 3,
                    hasControls: false,
                    hasBorders: false,
                    selectable: false,
                    lockMovementX: true,
                    lockMovementY: true,
                    hoverCursor: "default",
                    originX: "center",
                    originY: "center",
                    previousPoint: previousPoint,
                    nextPoint: newPoint
                }
            );

            // Adicionando as linhas ao ponto
            previousPoint.lineToNext = line
            newPoint.lineToPrevious = line
            // Adiciona a linha no canvas
            this.canvas.add(line)
        }
        else {
            listOfSegments.push(newPoint)
        }

        // Adiciona o ponto atual
        currentListOfPoints.push(newPoint)
        // Adiciona o ponto no canvas
        this.canvas.add(newPoint)

        // Renderiza
        this.render()
    }

    /**
     * Carrega um arquivo do tipo JSON que contém as coordenadas dos pontos
     * @param {any} file Arquivo para leitura dos pontos
     */
    loadPoints(file){
        // Cria um reader
        var reader = new FileReader()
        reader.onload = (f) => {
            var data = f.target.result
            var lastMode = mode
            mode = "Direta"
            // Carrega o arquivo json
            var segments = JSON.parse(data)
            for(var i=0; i<segments.length; i++) {
                var segment = segments[i]
                for(var j=0; j<segment.length; j++) {
                    var point = segment[j]
                    this.drawPoint(point.x, point.y)
                    
    
                }
                this.clearBuffer()
            }
            mode = lastMode
        }
        reader.readAsText(file)
    }

    /**
     * Limpa o buffer
     */
    clearBuffer() {
        currentListOfPoints = []
        
    }

    /**
     * Registra os eventos do mouse 
     * @param {String} eventName nome do evento
     * @param {Function} method função que chama o evento
     */
    registerEvents(eventName, method) {
        can.canvas.on(eventName, method)
    }

    /**
     * Ao mover o objeto
     * @param {Event} evt evento acionado ao mover o objeto no canvas
     */
    onObjectMoving(evt) {

        /**
         * Para cada ponto, recalculamos a posição da linha,
         * Caso o ponto esteja dentro de um grupo é preciso pegar a coordenada do centro do grupo
         * @param {Object} point ponto que está sendo selecionado
         * @param {Number} fixedLeft arruma a posição em X caso sejam uma seleção agrupada
         * @param {Number} fixedTop arruma a posição em Y caso sejam uma seleção agrupada
         */
        function EachPoint(point, fixedLeft, fixedTop){
    
            // Arruma a linha anterior
            if(point.lineToPrevious) {
                point.lineToPrevious.set({ 'x2': point.left + fixedLeft, 'y2': point.top + fixedTop });
            }
            // Arruma a linha posterior
            if(point.lineToNext) {
                point.lineToNext.set({ 'x1': point.left + fixedLeft, 'y1': point.top + fixedTop});
            }
        }
    
        // Se estou no modo de edição
        if(mode == "editar") {
            
            // Se é um grupo
            if(evt.target._objects){
                // Percorre todo os objetos do grupo
                for(var i = 0, len = evt.target._objects.length; i < len; i++){
    
                    // Recupera os pontos
                    var point = evt.target._objects[i]
    
                    // Desenha as linhas, enviando a coordenada central do grupo
                    EachPoint(point, evt.target.left + evt.target.width/2, evt.target.top + evt.target.height/2)
                }
            }
    
            // Se é só um ponto
            else{
               var point = evt.target; 
               EachPoint(point, 0, 0)
            }
      
            // Renderiza
            can.render()
        }      
    }

    /**
     * Lista os segmentos que estão desenhado no canvas para posterior salvamento 
     */
    showSegments() {

        var segments = []
        for(var i = 0, len = listOfSegments.length; i < len; i++){
    
            //Pega o corrent
            var current = listOfSegments[i];
            var buff = [{x: current.left, y:current.top}];
    
            //Loop de Lista encadeada
            while(current.lineToNext){
                //Pega o próximo ponto
                current = current.lineToNext.nextPoint
                buff.push({x: current.left, y:current.top})
            }
            // console.log(buff)
            segments.push(buff)
        }
        save.saveData(segments)
    }

    /**
     * Define os desenhos como selecionável ou não
     * @param {boolean} value booleano para seleção do objeto no canvas
     */
    setAllDrawsSelectable(value) {
        if(!value) value = false;

        //Desenhos feitos no Modo Direto
        for(var i = 0, len = listOfSegments.length; i < len; i++){

            //Pega o corrent
            var current = listOfSegments[i];

            //Define ele como selecionável ou não
            current.selectable = value

            //Loop de Lista encadeada
            while(current.lineToNext){
                //Pega o próximo ponto
                current = current.lineToNext.nextPoint
                //Define ele como selecionável ou não
                current.selectable = value
            }
        }
    }

    /**
    * Realiza a marcação livre
    */
    drawingFreeMarkup() {
        if(mode == "livre"){
            var brush = can.canvas.freeDrawingBrush
            brush.color = 'red'
            brush.width = 2
            

            can.canvas.isDrawingMode = !can.canvas.isDrawingMode
            if (can.canvas.isDrawingMode) {
                drawingModeEl.innerHTML = 'Cancel drawing mode'
            }
            else {
                drawingModeEl.innerHTML = 'Enter drawing mode'
            }
        }
    }

    /**
     * Limpa o canvas
     */
    clearCanvas() {
        if(mode == "limpar"){
            // Limpa o canvas
            can.canvas.clear()
            listOfSegments = []
            // limpa as variáveis
            can.clearBuffer()
            // Recarrega a imagem no canvas, se tiver
            if(imageLoaded)
                can.canvas.add(imageLoaded)

            can.canvas.selectable = false
        }
    }

}

/**
 * Classe que serve para realizar o salvamento dos dados
 */
class Save {
    /**
     * Faz download da imagem no formato .png 
     * @param {Object} btn botão vinculado ao download
     */
    saveImage(btn) {
        // Salva o arquivo no formato png
        if (mode == "salvarPNG") {
            console.log(this)
            btn.href = can.canvas.toDataURL({
                format: 'png'
            });
            btn.download = 'image.png'     
        }   
    }

    /**
     * Faz download das marcações no formato JSON
     * @param {Object} data Objeto a ser salvo em arquivo
     */
    saveData(data) {
        if (mode == "salvarJSON") {
            // converte canvas para uma string json
            var json = JSON.stringify(data);

            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(json);
            var dlAnchorElem = document.getElementById('downloadAnchorElem');
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", "scene.json");
            dlAnchorElem.click();
        }
    }

}

/**
 * Classe utilizada para abrir e carregar os arquivos
 */
class Load {

    /**
     * Carrega a imagem
     * @param {any} src imagem a ser carregada
     */
    loadImage(src) {
        // carrega a imagem
        fabric.Image.fromURL(src, function(oImg) {

            // seta as configurações da imagem
            oImg = oImg.set({
                scaleX: can.canvas.width / oImg.width,
                scaleY: can.canvas.height / oImg.height,
                // false para a imagem não ser selecionável
                selectable: false
            });

            imageLoaded = oImg
            // adiciona a imagem no canvas
            can.canvas.add(oImg)
            // canvas.render()
        })
    }

    /**
     * Função executada para abrir um arquivo
     */
    open() {
        
        //Estamos criados um tipo de input chamado "input [type]=file". Um componente html para envio de arquivo (1)
        var input = document.createElement('input')
        input.type = "file"

        //Escondemos este input na tela. Para o usuário não veja (2)
        document.getElementById('fileInputContainer').appendChild(input)
        var loader = this 
        //Esta função é chamada toda vez que um arquivo for selecionado pelo usuário (3)
        input.addEventListener('change', function () {
            
            //Se o arquivo for diferente de null e o primeiro arquivo enviado também não é nulo (5)
            if (this.files && this.files[0]) {
                if (mode == "abrirImagem") {
                    //Criamos um URl em Blob(?) e devolvemos uma URI gerada
                    var blobUri = URL.createObjectURL(this.files[0]) // set src to blob url(6)
                    //Função para abrir (7)
                    // callback(blobUri)
                    load.loadImage(blobUri)
                }
                else if (mode == "abrirJson") {
                    var file = this.files[0]
                    // callback(file)
                    console.log(can)
                    can.loadPoints(file)

                }
            }

            //Caso deu certo, ou não, removemos o input. Dando oportunidade para refazer um novo upload
            input.parentNode.removeChild(input)
        });

        //Apos clicar no botão Abrir, simulamos o click do botão file input que não é visível para o usuário (4)
        setTimeout(function(){
            $(input).click()
        },200)   
    }
}