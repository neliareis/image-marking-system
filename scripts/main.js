/**
 * Sistema de marcação de imagens 2D
 * @author Nelia Cantanhede Reis <neliakings@gmail.com>
 * @version 0.1
 */


/**
 * Configurações do canvas
 */
canvasConfigurations = {
    backgroundColor : "#fff", // cor do canvas
    isDrawingMode: false, // não começar desenhando
    width: $('.canvas-container').width(), // largura do canvas
    height: $('.canvas-container').height() // altura do canvas
}

/**
 * Instanciando as classes
 */
var can = new Canvas('c', canvasConfigurations)
var load = new Load()
var save = new Save()
 
/**
 * Ação Executada ao clicar no botão carregar imagem
 */
$("#btnCarregarImagem").click(function () { 
    mode = "abrirImagem"
    load.open()
});

/**
* Ação Executada ao clicar no botão carregar JSON
*/
$("#btnCarregarJson").click(function () { 
    mode = "abrirJson"
    load.open()
});


/**
 * Ação Executada ao clicar no botão salvar
 */
$("#btnSalvarPNG").click(function () { 
    mode = "salvarPNG"
    can.setAllDrawsSelectable(false)
    save.saveImage(this)
});

/**
 * Ação Executada ao clicar no botão salvar
 */
$("#btnSalvarJSON").click(function () { 
    mode = "salvarJSON"
    can.setAllDrawsSelectable(false)
    can.showSegments()
    
});

/**
 * Ação Executada ao clicar no botão marcação livre
 */
$("#btnMarcacaoLivre").click(function () { 
    mode = "livre"
    can.setAllDrawsSelectable(false)
    can.drawingFreeMarkup()
}); 

/**
 * Ação Executada ao clicar no botão marcação direta
 */
$("#btnMarcacaoDireta").click(function () { 
    mode = "direta"
    can.setAllDrawsSelectable(false)
    can.canvas.isDrawingMode = false
}); 

/**
 * Ação Executada ao clicar no botão editar
 */
$("#btnEditar").click(function () {
    // seleciona as marcações livre
    mode = "editar"
    can.canvas.isDrawingMode = false
    can.setAllDrawsSelectable(true)     
});

/**
 * Ação Executada ao clicar no botão limpar
 */
$("#btnLimpar").click(function () {  
    mode = "limpar"
    can.clearCanvas()
});
    
/**
 * Com um click no mouse, realiza o desenho das marcações
 * @param {Event} evt evento de um click no mouse
 */
function OnSingleClick(evt) {

    if(mode=="direta"){
        // Pegamos o ponteiro do Mouse
        var pointer = can.canvas.getPointer(evt.e)
        // Recuperamos o X e o Y
        var positionX = pointer.x;
        var positionY = pointer.y;

        can.drawPoint(positionX, positionY)
        
    }
}

/**
 * Evento de duplo click no mouse, para limpar o buffer
 */
function OnDblClick() {
    can.clearBuffer()
}


// Eventos

/**
* Evento de duplo click para parada do desenho
*/
can.canvas.upperCanvasEl.addEventListener("dblclick", OnDblClick)

/**
* Evento de click do desenho
*/
can.registerEvents("mouse:down", OnSingleClick)

/**
* Evento de movimentação do desenho
*/
can.registerEvents('object:moving', can.onObjectMoving)