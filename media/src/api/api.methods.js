

/**
 * Perform a jQuery selector action on the table's TR elements (from the tbody) and
 * return the resulting expression
 *  @param {string} sSelector jQuery selector
 *  @returns {object} jQuery object
 */
this.$ = function ( sSelector )
{
	// xxx - filtering, sorting, column visibility options
	var oSettings = _fnSettingsFromNode(this[_oExt.iApiIndex]);
	return $(this.oApi._fnGetTrNodes(oSettings)).filter(sSelector);
};


/**
 * Add a single new row or multiple rows of data to the table. Please note
 * that this is suitable for client-side processing only - if you are using 
 * server-side processing (i.e. "bServerSide": true), then to add data, you
 * must add it to the data source, i.e. the server-side, through an Ajax call.
 *  @param {array|object} mData The data to be added to the table. This can be:
 *    <ul>
 *      <li>1D array of data - add a single row with the data provided</li>
 *      <li>2D array of arrays - add multiple rows in a single call</li>
 *      <li>object - data object when using <i>mDataProp</i></li>
 *      <li>array of objects - multiple data objects when using <i>mDataProp</i></li>
 *    </ul>
 *  @param {bool} [bRedraw=true] redraw the table or not
 *  @returns {array} An array of integers, representing the list of indexes in 
 *    <i>aoData</i> ({@link DataTable.models.oSettings}) that have been added to 
 *    the table.
 *
 *  @example
 *    // Global var for counter
 *    var giCount = 2;
 *    
 *    $(document).ready(function() {
 *      $('#example').dataTable();
 *    } );
 *    
 *    function fnClickAddRow() {
 *      $('#example').dataTable().fnAddData( [
 *        giCount+".1",
 *        giCount+".2",
 *        giCount+".3",
 *        giCount+".4" ]
 *      );
 *        
 *      giCount++;
 *    }
 */
this.fnAddData = function( mData, bRedraw )
{
	if ( mData.length === 0 )
	{
		return [];
	}
	
	var aiReturn = [];
	var iTest;
	
	/* Find settings from table node */
	var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
	
	/* Check if we want to add multiple rows or not */
	if ( typeof mData[0] == "object" )
	{
		for ( var i=0 ; i<mData.length ; i++ )
		{
			iTest = _fnAddData( oSettings, mData[i] );
			if ( iTest == -1 )
			{
				return aiReturn;
			}
			aiReturn.push( iTest );
		}
	}
	else
	{
		iTest = _fnAddData( oSettings, mData );
		if ( iTest == -1 )
		{
			return aiReturn;
		}
		aiReturn.push( iTest );
	}
	
	oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
	
	if ( typeof bRedraw == 'undefined' || bRedraw )
	{
		_fnReDraw( oSettings );
	}
	return aiReturn;
};


/**
 * This function will make DataTables recalculate the column sizes, based on the data 
 * contained in the table and the sizes applied to the columns (in the DOM, CSS or 
 * through the sWidth parameter). This can be useful when the width of the table's 
 * parent element changes (for example a window resize).
 *  @param {boolean} [bRedraw=true] Redraw the table or not, you will typically want to
 *
 *  @example
 *    $(document).ready(function() {
 *      var oTable = $('#example').dataTable( {
 *        "sScrollY": "200px",
 *        "bPaginate": false
 *      } );
 *      
 *      $(window).bind('resize', function () {
 *        oTable.fnAdjustColumnSizing();
 *      } );
 *    } );
 */
this.fnAdjustColumnSizing = function ( bRedraw )
{
	var oSettings = _fnSettingsFromNode(this[_oExt.iApiIndex]);
	_fnAdjustColumnSizing( oSettings );
	
	if ( typeof bRedraw == 'undefined' || bRedraw )
	{
		this.fnDraw( false );
	}
	else if ( oSettings.oScroll.sX !== "" || oSettings.oScroll.sY !== "" )
	{
		/* If not redrawing, but scrolling, we want to apply the new column sizes anyway */
		this.oApi._fnScrollDraw(oSettings);
	}
};


/**
 * Quickly and simply clear a table
 *  @param {bool} [bRedraw=true] redraw the table or not
 *
 *  @example
 *    $(document).ready(function() {
 *      var oTable = $('#example').dataTable();
 *      
 *      // Immediately 'nuke' the current rows (perhaps waiting for an Ajax callback...)
 *      oTable.fnClearTable();
 *    } );
 */
this.fnClearTable = function( bRedraw )
{
	/* Find settings from table node */
	var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
	_fnClearTable( oSettings );
	
	if ( typeof bRedraw == 'undefined' || bRedraw )
	{
		_fnDraw( oSettings );
	}
};


/**
 * The exact opposite of 'opening' a row, this function will close any rows which 
 * are currently 'open'.
 *  @param {node} nTr the table row to 'close'
 *  @returns {int} 0 on success, or 1 if failed (can't find the row)
 *
 *  @example
 *    $(document).ready(function() {
 *      var oTable;
 *      
 *      // 'open' an information row when a row is clicked on
 *      $('#example tbody tr').click( function () {
 *        var that = this;
 *        oTable.fnOpen( this, "Temporary row opened", "info_row" );
 *        
 *        // Then when the info row is clicked upon - close it
 *        $('#example .info_row').click( function () {
 *          oTable.fnClose(that);
 *        } );
 *      } );
 *      
 *      oTable = $('#example').dataTable();
 *    } );
 */
this.fnClose = function( nTr )
{
	/* Find settings from table node */
	var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
	
	for ( var i=0 ; i<oSettings.aoOpenRows.length ; i++ )
	{
		if ( oSettings.aoOpenRows[i].nParent == nTr )
		{
			var nTrParent = oSettings.aoOpenRows[i].nTr.parentNode;
			if ( nTrParent )
			{
				/* Remove it if it is currently on display */
				nTrParent.removeChild( oSettings.aoOpenRows[i].nTr );
			}
			oSettings.aoOpenRows.splice( i, 1 );
			return 0;
		}
	}
	return 1;
};


/**
 * Remove a row for the table
 *  @param {mixed} mTarget The index of the row from aoData to be deleted, or
 *    the TR element you want to delete
 *  @param {function|null} [fnCallBack] Callback function
 *  @param {bool} [bRedraw=true] Redraw the table or not
 *  @returns {array} The row that was deleted
 *
 *  @example
 *    $(document).ready(function() {
 *      var oTable = $('#example').dataTable();
 *      
 *      // Immediately remove the first row
 *      oTable.fnDeleteRow( 0 );
 *    } );
 */
this.fnDeleteRow = function( mTarget, fnCallBack, bRedraw )
{
	/* Find settings from table node */
	var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
	var i, iAODataIndex;
	
	iAODataIndex = (typeof mTarget == 'object') ? 
		_fnNodeToDataIndex(oSettings, mTarget) : mTarget;
	
	/* Return the data array from this row */
	var oData = oSettings.aoData.splice( iAODataIndex, 1 );
	
	/* Remove the target row from the search array */
	var iDisplayIndex = $.inArray( iAODataIndex, oSettings.aiDisplay );
	oSettings.asDataSearch.splice( iDisplayIndex, 1 );
	
	/* Delete from the display arrays */
	_fnDeleteIndex( oSettings.aiDisplayMaster, iAODataIndex );
	_fnDeleteIndex( oSettings.aiDisplay, iAODataIndex );
	
	/* If there is a user callback function - call it */
	if ( typeof fnCallBack == "function" )
	{
		fnCallBack.call( this, oSettings, oData );
	}
	
	/* Check for an 'overflow' they case for dislaying the table */
	if ( oSettings._iDisplayStart >= oSettings.aiDisplay.length )
	{
		oSettings._iDisplayStart -= oSettings._iDisplayLength;
		if ( oSettings._iDisplayStart < 0 )
		{
			oSettings._iDisplayStart = 0;
		}
	}
	
	if ( typeof bRedraw == 'undefined' || bRedraw )
	{
		_fnCalculateEnd( oSettings );
		_fnDraw( oSettings );
	}
	
	return oData;
};


/**
 * Restore the table to it's original state in the DOM by removing all of DataTables 
 * enhancements, alterations to the DOM structure of the table and event listeners.
 *  @param {boolean} [bRemove=false] Completely remove the table from the DOM
 *
 *  @example
 *    $(document).ready(function() {
 *      // This example is fairly pointless in reality, but shows how fnDestroy can be used
 *      var oTable = $('#example').dataTable();
 *      oTable.fnDestroy();
 *    } );
 */
this.fnDestroy = function ( bRemove )
{
	var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
	var nOrig = oSettings.nTableWrapper.parentNode;
	var nBody = oSettings.nTBody;
	var i, iLen;

	bRemove = (typeof bRemove=='undefined') ? false : true;
	
	/* Flag to note that the table is currently being destroyed - no action should be taken */
	oSettings.bDestroying = true;
	
	/* Restore hidden columns */
	for ( i=0, iLen=oSettings.aoDestroyCallback.length ; i<iLen ; i++ ) {
		oSettings.aoDestroyCallback[i].fn();
	}
	
	/* Restore hidden columns */
	for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
	{
		if ( oSettings.aoColumns[i].bVisible === false )
		{
			this.fnSetColumnVis( i, true );
		}
	}
	
	/* Blitz all DT events */
	$(oSettings.nTableWrapper).find('*').andSelf().unbind('.DT');
	
	/* If there is an 'empty' indicator row, remove it */
	$('tbody>tr>td.'+oSettings.oClasses.sRowEmpty, oSettings.nTable).parent().remove();
	
	/* When scrolling we had to break the table up - restore it */
	if ( oSettings.nTable != oSettings.nTHead.parentNode )
	{
		$(oSettings.nTable).children('thead').remove();
		oSettings.nTable.appendChild( oSettings.nTHead );
	}
	
	if ( oSettings.nTFoot && oSettings.nTable != oSettings.nTFoot.parentNode )
	{
		$(oSettings.nTable).children('tfoot').remove();
		oSettings.nTable.appendChild( oSettings.nTFoot );
	}
	
	/* Remove the DataTables generated nodes, events and classes */
	oSettings.nTable.parentNode.removeChild( oSettings.nTable );
	$(oSettings.nTableWrapper).remove();
	
	oSettings.aaSorting = [];
	oSettings.aaSortingFixed = [];
	_fnSortingClasses( oSettings );
	
	$(_fnGetTrNodes( oSettings )).removeClass( oSettings.asStripeClasses.join(' ') );
	
	if ( !oSettings.bJUI )
	{
		$('th', oSettings.nTHead).removeClass( [ _oExt.oStdClasses.sSortable,
			_oExt.oStdClasses.sSortableAsc,
			_oExt.oStdClasses.sSortableDesc,
			_oExt.oStdClasses.sSortableNone ].join(' ')
		);
	}
	else
	{
		$('th, td', oSettings.nTHead).removeClass( [ _oExt.oStdClasses.sSortable,
			_oExt.oJUIClasses.sSortableAsc,
			_oExt.oJUIClasses.sSortableDesc,
			_oExt.oJUIClasses.sSortableNone ].join(' ')
		);
		$('th span.'+_oExt.oJUIClasses.sSortIcon
			+ ', td span.'+_oExt.oJUIClasses.sSortIcon, oSettings.nTHead).remove();

		$('th, td', oSettings.nTHead).each( function () {
			var jqWrapper = $('div.'+_oExt.oJUIClasses.sSortJUIWrapper, this);
			var kids = jqWrapper.contents();
			$(this).append( kids );
			jqWrapper.remove();
		} );
	}
	
	/* Add the TR elements back into the table in their original order */
	if ( !bRemove && oSettings.nTableReinsertBefore )
	{
		nOrig.insertBefore( oSettings.nTable, oSettings.nTableReinsertBefore );
	}
	else if ( !bRemove )
	{
		nOrig.appendChild( oSettings.nTable );
	}

	for ( i=0, iLen=oSettings.aoData.length ; i<iLen ; i++ )
	{
		if ( oSettings.aoData[i].nTr !== null )
		{
			nBody.appendChild( oSettings.aoData[i].nTr );
		}
	}
	
	/* Restore the width of the original table */
	if ( oSettings.oFeatures.bAutoWidth === true )
	{
	  oSettings.nTable.style.width = _fnStringToCss(oSettings.sDestroyWidth);
	}
	
	/* If the were originally odd/even type classes - then we add them back here. Note
	 * this is not fool proof (for example if not all rows as odd/even classes - but 
	 * it's a good effort without getting carried away
	 */
	$(nBody).children('tr:even').addClass( oSettings.asDestroyStripes[0] );
	$(nBody).children('tr:odd').addClass( oSettings.asDestroyStripes[1] );
	
	/* Remove the settings object from the settings array */
	for ( i=0, iLen=_aoSettings.length ; i<iLen ; i++ )
	{
		if ( _aoSettings[i] == oSettings )
		{
			_aoSettings.splice( i, 1 );
		}
	}
	
	/* End it all */
	oSettings = null;
};


/**
 * Redraw the table
 *  @param {bool} [bComplete=true] Re-filter and resort (if enabled) the table before the draw.
 *
 *  @example
 *    $(document).ready(function() {
 *      var oTable = $('#example').dataTable();
 *      
 *      // Re-draw the table - you wouldn't want to do it here, but it's an example :-)
 *      oTable.fnDraw();
 *    } );
 */
this.fnDraw = function( bComplete )
{
	var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
	if ( typeof bComplete != 'undefined' && bComplete === false )
	{
		_fnCalculateEnd( oSettings );
		_fnDraw( oSettings );
	}
	else
	{
		_fnReDraw( oSettings );
	}
};


/**
 * Filter the input based on data
 *  @param {string} sInput string to filter the table on
 *  @param {int|null} [iColumn] column to limit filtering to
 *  @param {bool} [bRegex=false] treat as regular expression or not
 *  @param {bool} [bSmart=true] perform smart filtering or not
 *  @param {bool} [bShowGlobal=true] show the input global filter in it's input box(es)
 *
 *  @example
 *    $(document).ready(function() {
 *      var oTable = $('#example').dataTable();
 *      
 *      // Sometime later - filter...
 *      oTable.fnFilter( 'test string' );
 *    } );
 */
this.fnFilter = function( sInput, iColumn, bRegex, bSmart, bShowGlobal )
{
	var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
	
	if ( !oSettings.oFeatures.bFilter )
	{
		return;
	}
	
	if ( typeof bRegex == 'undefined' )
	{
		bRegex = false;
	}
	
	if ( typeof bSmart == 'undefined' )
	{
		bSmart = true;
	}
	
	if ( typeof bShowGlobal == 'undefined' )
	{
		bShowGlobal = true;
	}
	
	if ( typeof iColumn == "undefined" || iColumn === null )
	{
		/* Global filter */
		_fnFilterComplete( oSettings, {
			"sSearch":sInput+"",
			"bRegex": bRegex,
			"bSmart": bSmart
		}, 1 );
		
		if ( bShowGlobal && typeof oSettings.aanFeatures.f != 'undefined' )
		{
			var n = oSettings.aanFeatures.f;
			for ( var i=0, iLen=n.length ; i<iLen ; i++ )
			{
				$('input', n[i]).val( sInput );
			}
		}
	}
	else
	{
		/* Single column filter */
		oSettings.aoPreSearchCols[ iColumn ].sSearch = sInput+"";
		oSettings.aoPreSearchCols[ iColumn ].bRegex = bRegex;
		oSettings.aoPreSearchCols[ iColumn ].bSmart = bSmart;
		_fnFilterComplete( oSettings, oSettings.oPreviousSearch, 1 );
	}
};


/**
 * Return an array with the data which is used to make up the table
 * or string if both row and column are given
 *  @param {mixed} [mRow] The TR row element to get the data for, or the aoData
 *    internal index (mapped to the TR element)
 *  @param {int} [iCol] Optional column index that you want the data of
 *  @returns {array|string} If mRow is undefined, then the data for all rows is
 *    returned. If mRow is defined, just data for that row, and is iCol is
 *    defined, only data for the designated cell is returned.
 *
 *  @example
 *    $(document).ready(function() {
 *      $('#example tbody td').click( function () {
 *        // Get the position of the current data from the node
 *        var aPos = oTable.fnGetPosition( this );
 *        
 *        // Get the data array for this row
 *        var aData = oTable.fnGetData( this.parentNode );
 *        
 *        // Update the data array and return the value
 *        aData[ aPos[1] ] = 'clicked';
 *        this.innerHTML = 'clicked';
 *      } );
 *      
 *      // Init DataTables
 *      oTable = $('#example').dataTable();
 *    } );
 */
this.fnGetData = function( mRow, iCol )
{
	var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
	
	if ( typeof mRow != 'undefined' )
	{
		var iRow = (typeof mRow == 'object') ? 
			_fnNodeToDataIndex(oSettings, mRow) : mRow;
		
		if ( typeof iCol != 'undefined' )
		{
			return _fnGetCellData( oSettings, iRow, iCol, '' );
		}
		return (typeof oSettings.aoData[iRow] != 'undefined') ? 
			oSettings.aoData[iRow]._aData : null;
	}
	return _fnGetDataMaster( oSettings );
};


/**
 * The the TR nodes that are used in the table's body
 *  @param {int} [iRow] Optional row index for the TR element you want
 *  @returns {array|node} If iRow is undefined, returns an array of all TR elements
 *    in the table's body, or iRow is defined, just the TR element requested.
 *
 *  @example
 *    $(document).ready(function() {
 *      var oTable = $('#example').dataTable();
 *      
 *      // Get the nodes from the table
 *      var nNodes = oTable.fnGetNodes( );
 *    } );
 */
this.fnGetNodes = function( iRow )
{
	var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
	
	if ( typeof iRow != 'undefined' )
	{
		return (typeof oSettings.aoData[iRow] != 'undefined') ? oSettings.aoData[iRow].nTr : null;
	}
	return _fnGetTrNodes( oSettings );
};


/**
 * Get the array indexes of a particular cell from it's DOM element
 * and column index including hidden columns
 *  @param {node} nNode this can either be a TR, TD or TH in the table's body
 *  @returns {int} If nNode is given as a TR, then a single index is returned, or
 *    if given as a cell, an array of [row index, column index (visible)] is given.
 *
 *  @example
 *    $(document).ready(function() {
 *      $('#example tbody td').click( function () {
 *        // Get the position of the current data from the node
 *        var aPos = oTable.fnGetPosition( this );
 *        
 *        // Get the data array for this row
 *        var aData = oTable.fnGetData( aPos[0] );
 *        
 *        // Update the data array and return the value
 *        aData[ aPos[1] ] = 'clicked';
 *        this.innerHTML = 'clicked';
 *      } );
 *      
 *      // Init DataTables
 *      oTable = $('#example').dataTable();
 *    } );
 */
this.fnGetPosition = function( nNode )
{
	var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
	var sNodeName = nNode.nodeName.toUpperCase();
	
	if ( sNodeName == "TR" )
	{
		return _fnNodeToDataIndex(oSettings, nNode);
	}
	else if ( sNodeName == "TD" || sNodeName == "TH" )
	{
		var iDataIndex = _fnNodeToDataIndex(oSettings, nNode.parentNode);
		var anCells = _fnGetTdNodes( oSettings, iDataIndex );

		for ( var i=0 ; i<oSettings.aoColumns.length ; i++ )
		{
			if ( anCells[i] == nNode )
			{
				return [ iDataIndex, _fnColumnIndexToVisible(oSettings, i ), i ];
			}
		}
	}
	return null;
};


/**
 * This function will place a new row directly after a row which is currently 
 * on display on the page, with the HTML contents that is passed into the 
 * function. This can be used, for example, to ask for confirmation that a 
 * particular record should be deleted.
 *  @param {node} nTr The table row to 'open'
 *  @param {string|node|jQuery} mHtml The HTML to put into the row
 *  @param {string} sClass Class to give the new TD cell
 *  @returns {node} The row opened
 *
 *  @example
 *    $(document).ready(function() {
 *      var oTable;
 *      
 *      // 'open' an information row when a row is clicked on
 *      $('#example tbody tr').click( function () {
 *        var that = this;
 *        oTable.fnOpen( this, "Temporary row opened", "info_row" );
 *        
 *        // Then when the info row is clicked upon - close it
 *        $('#example .info_row').click( function () {
 *          oTable.fnClose(that);
 *        } );
 *      } );
 *      
 *      oTable = $('#example').dataTable();
 *    } );
 */
this.fnOpen = function( nTr, mHtml, sClass )
{
	/* Find settings from table node */
	var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
	
	/* the old open one if there is one */
	this.fnClose( nTr );
	
	var nNewRow = document.createElement("tr");
	var nNewCell = document.createElement("td");
	nNewRow.appendChild( nNewCell );
	nNewCell.className = sClass;
	nNewCell.colSpan = _fnVisbleColumns( oSettings );

	if( typeof mHtml.jquery != 'undefined' || typeof mHtml == "object" )
	{
		nNewCell.appendChild( mHtml );
	}
	else
	{
		nNewCell.innerHTML = mHtml;
	}

	/* If the nTr isn't on the page at the moment - then we don't insert at the moment */
	var nTrs = $('tr', oSettings.nTBody);
	if ( $.inArray(nTr, nTrs) != -1 )
	{
		$(nNewRow).insertAfter(nTr);
	}
	
	oSettings.aoOpenRows.push( {
		"nTr": nNewRow,
		"nParent": nTr
	} );
	
	return nNewRow;
};


/**
 * Change the pagination - provides the internal logic for pagination in a simple API 
 * function. With this function you can have a DataTables table go to the next, 
 * previous, first or last pages.
 *  @param {string} sAction Paging action to take: "first", "previous", "next" or "last"
 *  @param {bool} [bRedraw=true] Redraw the table or not
 *
 *  @example
 *    $(document).ready(function() {
 *      var oTable = $('#example').dataTable();
 *      oTable.fnPageChange( 'next' );
 *    } );
 */
this.fnPageChange = function ( sAction, bRedraw )
{
	var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
	_fnPageChange( oSettings, sAction );
	_fnCalculateEnd( oSettings );
	
	if ( typeof bRedraw == 'undefined' || bRedraw )
	{
		_fnDraw( oSettings );
	}
};


/**
 * Show a particular column
 *  @param {int} iCol The column whose display should be changed
 *  @param {bool} bShow Show (true) or hide (false) the column
 *  @param {bool} [bRedraw=true] Redraw the table or not
 *
 *  @example
 *    $(document).ready(function() {
 *      var oTable = $('#example').dataTable();
 *      
 *      // Hide the second column after initialisation
 *      oTable.fnSetColumnVis( 1, false );
 *    } );
 */
this.fnSetColumnVis = function ( iCol, bShow, bRedraw )
{
	var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
	var i, iLen;
	var iColumns = oSettings.aoColumns.length;
	var nTd, nCell, anTrs, jqChildren, bAppend, iBefore;
	
	/* No point in doing anything if we are requesting what is already true */
	if ( oSettings.aoColumns[iCol].bVisible == bShow )
	{
		return;
	}
	
	/* Show the column */
	if ( bShow )
	{
		var iInsert = 0;
		for ( i=0 ; i<iCol ; i++ )
		{
			if ( oSettings.aoColumns[i].bVisible )
			{
				iInsert++;
			}
		}
		
		/* Need to decide if we should use appendChild or insertBefore */
		bAppend = (iInsert >= _fnVisbleColumns( oSettings ));

		/* Which coloumn should we be inserting before? */
		if ( !bAppend )
		{
			for ( i=iCol ; i<iColumns ; i++ )
			{
				if ( oSettings.aoColumns[i].bVisible )
				{
					iBefore = i;
					break;
				}
			}
		}

		for ( i=0, iLen=oSettings.aoData.length ; i<iLen ; i++ )
		{
			if ( oSettings.aoData[i].nTr !== null )
			{
				if ( bAppend )
				{
					oSettings.aoData[i].nTr.appendChild( 
						oSettings.aoData[i]._anHidden[iCol]
					);
				}
				else
				{
					oSettings.aoData[i].nTr.insertBefore(
						oSettings.aoData[i]._anHidden[iCol], 
						_fnGetTdNodes( oSettings, i )[iBefore] );
				}
			}
		}
	}
	else
	{
		/* Remove a column from display */
		for ( i=0, iLen=oSettings.aoData.length ; i<iLen ; i++ )
		{
			if ( oSettings.aoData[i].nTr !== null )
			{
				nTd = _fnGetTdNodes( oSettings, i )[iCol];
				oSettings.aoData[i]._anHidden[iCol] = nTd;
				nTd.parentNode.removeChild( nTd );
			}
		}
	}

	/* Clear to set the visible flag */
	oSettings.aoColumns[iCol].bVisible = bShow;

	/* Redraw the header and footer based on the new column visibility */
	_fnDrawHead( oSettings, oSettings.aoHeader );
	if ( oSettings.nTFoot )
	{
		_fnDrawHead( oSettings, oSettings.aoFooter );
	}
	
	/* If there are any 'open' rows, then we need to alter the colspan for this col change */
	for ( i=0, iLen=oSettings.aoOpenRows.length ; i<iLen ; i++ )
	{
		oSettings.aoOpenRows[i].nTr.colSpan = _fnVisbleColumns( oSettings );
	}
	
	/* Do a redraw incase anything depending on the table columns needs it 
	 * (built-in: scrolling) 
	 */
	if ( typeof bRedraw == 'undefined' || bRedraw )
	{
		_fnAdjustColumnSizing( oSettings );
		_fnDraw( oSettings );
	}
	
	_fnSaveState( oSettings );
};


/**
 * Get the settings for a particular table for external manipulation
 *  @returns {object} DataTables settings object. See 
 *    {@link DataTable.models.oSettings}
 *
 *  @example
 *    $(document).ready(function() {
 *      var oTable = $('#example').dataTable();
 *      var oSettings = oTable.fnSettings();
 *      
 *      // Show an example parameter from the settings
 *      alert( oSettings._iDisplayStart );
 *    } );
 */
this.fnSettings = function()
{
	return _fnSettingsFromNode( this[_oExt.iApiIndex] );
};


/**
 * Sort the table by a particular row
 *  @param {int} iCol the data index to sort on. Note that this will not match the 
 *    'display index' if you have hidden data entries
 *
 *  @example
 *    $(document).ready(function() {
 *      var oTable = $('#example').dataTable();
 *      
 *      // Sort immediately with columns 0 and 1
 *      oTable.fnSort( [ [0,'asc'], [1,'asc'] ] );
 *    } );
 */
this.fnSort = function( aaSort )
{
	var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
	oSettings.aaSorting = aaSort;
	_fnSort( oSettings );
};


/**
 * Attach a sort listener to an element for a given column
 *  @param {node} nNode the element to attach the sort listener to
 *  @param {int} iColumn the column that a click on this node will sort on
 *  @param {function} [fnCallback] callback function when sort is run
 *
 *  @example
 *    $(document).ready(function() {
 *      var oTable = $('#example').dataTable();
 *      
 *      // Sort on column 1, when 'sorter' is clicked on
 *      oTable.fnSortListener( document.getElementById('sorter'), 1 );
 *    } );
 */
this.fnSortListener = function( nNode, iColumn, fnCallback )
{
	_fnSortAttachListener( _fnSettingsFromNode( this[_oExt.iApiIndex] ), nNode, iColumn,
	 	fnCallback );
};


/**
 * Update a table cell or row - this method will accept either a single value to
 * update the cell with, an array of values with one element for each column or
 * an object in the same format as the original data source. The function is
 * self-referencing in order to make the multi column updates easier.
 *  @param {object|array|string} mData Data to update the cell/row with
 *  @param {node|int} mRow TR element you want to update or the aoData index
 *  @param {int} [iColumn] The column to update (not used of mData is an array or object)
 *  @param {bool} [bRedraw=true] Redraw the table or not
 *  @param {bool} [bAction=true] Perform predraw actions or not
 *  @returns {int} 0 on success, 1 on error
 *
 *  @example
 *    $(document).ready(function() {
 *      var oTable = $('#example').dataTable();
 *      oTable.fnUpdate( 'Example update', 0, 0 ); // Single cell
 *      oTable.fnUpdate( ['a', 'b', 'c', 'd', 'e'], 1, 0 ); // Row
 *    } );
 */
this.fnUpdate = function( mData, mRow, iColumn, bRedraw, bAction )
{
	var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
	var iVisibleColumn, i, iLen, sDisplay;
	var iRow = (typeof mRow == 'object') ? 
		_fnNodeToDataIndex(oSettings, mRow) : mRow;
	
	if ( typeof oSettings.__fnUpdateDeep == 'undefined' && $.isArray(mData) && typeof mData == 'object' )
	{
		/* Array update - update the whole row */
		oSettings.aoData[iRow]._aData = mData.slice();
		
		/* Flag to the function that we are recursing */
		oSettings.__fnUpdateDeep = true;
		for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
		{
			this.fnUpdate( _fnGetCellData( oSettings, iRow, i ), iRow, i, false, false );
		}
		oSettings.__fnUpdateDeep = undefined;
	}
	else if ( typeof oSettings.__fnUpdateDeep == 'undefined' && mData !== null && typeof mData == 'object' )
	{
		/* Object update - update the whole row - assume the developer gets the object right */
		oSettings.aoData[iRow]._aData = $.extend( true, {}, mData );

		oSettings.__fnUpdateDeep = true;
		for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
		{
			this.fnUpdate( _fnGetCellData( oSettings, iRow, i ), iRow, i, false, false );
		}
		oSettings.__fnUpdateDeep = undefined;
	}
	else
	{
		/* Individual cell update */
		sDisplay = mData;
		_fnSetCellData( oSettings, iRow, iColumn, sDisplay );
		
		if ( oSettings.aoColumns[iColumn].fnRender !== null )
		{
			sDisplay = oSettings.aoColumns[iColumn].fnRender( {
				"iDataRow": iRow,
				"iDataColumn": iColumn,
				"aData": oSettings.aoData[iRow]._aData,
				"oSettings": oSettings
			} );
			
			if ( oSettings.aoColumns[iColumn].bUseRendered )
			{
				_fnSetCellData( oSettings, iRow, iColumn, sDisplay );
			}
		}
		
		if ( oSettings.aoData[iRow].nTr !== null )
		{
			/* Do the actual HTML update */
			_fnGetTdNodes( oSettings, iRow )[iColumn].innerHTML = sDisplay;
		}
	}
	
	/* Modify the search index for this row (strictly this is likely not needed, since fnReDraw
	 * will rebuild the search array - however, the redraw might be disabled by the user)
	 */
	var iDisplayIndex = $.inArray( iRow, oSettings.aiDisplay );
	oSettings.asDataSearch[iDisplayIndex] = _fnBuildSearchRow( oSettings, 
		_fnGetRowData( oSettings, iRow, 'filter' ) );
	
	/* Perform pre-draw actions */
	if ( typeof bAction == 'undefined' || bAction )
	{
		_fnAdjustColumnSizing( oSettings );
	}
	
	/* Redraw the table */
	if ( typeof bRedraw == 'undefined' || bRedraw )
	{
		_fnReDraw( oSettings );
	}
	return 0;
};


/**
 * Provide a common method for plug-ins to check the version of DataTables being used, in order
 * to ensure compatibility.
 *  @param {string} sVersion Version string to check for, in the format "X.Y.Z". Note that the
 *    formats "X" and "X.Y" are also acceptable.
 *  @returns {boolean} true if this version of DataTables is greater or equal to the required
 *    version, or false if this version of DataTales is not suitable
 *
 *  @example
 *    $(document).ready(function() {
 *      var oTable = $('#example').dataTable();
 *      alert( oTable.fnVersionCheck( '1.9.0' ) );
 *    } );
 */
this.fnVersionCheck = _oExt.fnVersionCheck;
